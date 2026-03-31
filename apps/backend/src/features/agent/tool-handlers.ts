import { prisma } from "../database/prisma.js";
import type { ToolHandlerResult } from "./types.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayRange(): { start: Date; end: Date } {
	const start = new Date();
	start.setHours(0, 0, 0, 0);
	const end = new Date();
	end.setHours(23, 59, 59, 999);
	return { start, end };
}

function getMedicationDisplayName(med: { nameGeneric: string; nameBrand: string | null }): string {
	return med.nameBrand
		? `${med.nameBrand} (${med.nameGeneric})`
		: med.nameGeneric;
}

// ─── Tool Handlers ────────────────────────────────────────────────────────────

export async function handleGetTodayIntakeStatus(
	patientId: string,
	args: { medicationName?: string },
): Promise<ToolHandlerResult> {
	const { start, end } = getTodayRange();

	const prescriptions = await prisma.prescriptionMedication.findMany({
		where: {
			patientId,
			isActive: true,
			...(args.medicationName
				? {
						medication: {
							OR: [
								{ nameGeneric: { contains: args.medicationName, mode: "insensitive" } },
								{ nameBrand: { contains: args.medicationName, mode: "insensitive" } },
							],
						},
					}
				: {}),
		},
		include: {
			medication: true,
			doseSchedules: true,
			intakeEvents: {
				where: { takenAt: { gte: start, lte: end } },
			},
		},
	});

	const statusList = prescriptions.map((pm) => {
		const totalDoses = pm.doseSchedules.length;
		const takenDoses = pm.intakeEvents.filter((e) => e.status === "TAKEN").length;
		const skippedDoses = pm.intakeEvents.filter((e) => e.status === "SKIPPED").length;

		return {
			medicationName: getMedicationDisplayName(pm.medication),
			dosageAmount: pm.dosageAmount,
			totalScheduledToday: totalDoses,
			takenToday: takenDoses,
			skippedToday: skippedDoses,
			remainingToday: Math.max(0, totalDoses - takenDoses - skippedDoses),
			times: pm.doseSchedules.map((ds) => ds.timeOfDay),
		};
	});

	return { success: true, data: statusList };
}

export async function handleGetMedicationList(
	patientId: string,
): Promise<ToolHandlerResult> {
	const prescriptions = await prisma.prescriptionMedication.findMany({
		where: { patientId, isActive: true },
		include: { medication: true, doseSchedules: true },
	});

	const medicationList = prescriptions.map((pm) => ({
		medicationName: getMedicationDisplayName(pm.medication),
		dosageAmount: pm.dosageAmount,
		form: pm.form,
		frequency: pm.frequency,
		mealStatus: pm.mealStatus,
		times: pm.doseSchedules.map((ds) => ds.timeOfDay),
		currentStock: pm.currentStock,
	}));

	return { success: true, data: medicationList };
}

export async function handleGetNextDose(
	patientId: string,
): Promise<ToolHandlerResult> {
	const { start, end } = getTodayRange();
	const now = new Date();
	const nowMinutes = now.getHours() * 60 + now.getMinutes();

	const prescriptions = await prisma.prescriptionMedication.findMany({
		where: { patientId, isActive: true },
		include: {
			medication: true,
			doseSchedules: true,
			intakeEvents: {
				where: { takenAt: { gte: start, lte: end } },
			},
		},
	});

	type UpcomingDose = {
		medicationName: string;
		dosageAmount: string;
		scheduledTime: string;
		mealStatus: string;
	};

	const upcomingDoses: UpcomingDose[] = [];

	for (const pm of prescriptions) {
		const takenTimes = new Set(
			pm.intakeEvents
				.filter((e) => e.status === "TAKEN")
				.map((e) => {
					const d = new Date(e.takenAt);
					return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
				}),
		);

		for (const schedule of pm.doseSchedules) {
			const parts = schedule.timeOfDay.split(":").map(Number);
			const scheduleMinutes = (parts[0] ?? 0) * 60 + (parts[1] ?? 0);

			// Only future doses that haven't been taken
			if (scheduleMinutes > nowMinutes && !takenTimes.has(schedule.timeOfDay)) {
				upcomingDoses.push({
					medicationName: getMedicationDisplayName(pm.medication),
					dosageAmount: pm.dosageAmount,
					scheduledTime: schedule.timeOfDay,
					mealStatus: pm.mealStatus,
				});
			}
		}
	}

	upcomingDoses.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

	if (upcomingDoses.length === 0) {
		return { success: true, data: { message: "Bugün için kalan ilaç dozunuz yok." } };
	}

	return { success: true, data: { nextDose: upcomingDoses[0], allUpcoming: upcomingDoses } };
}

export async function handleGetMedicationUsageInfo(
	patientId: string,
	args: { medicationName: string },
): Promise<ToolHandlerResult> {
	const prescription = await prisma.prescriptionMedication.findFirst({
		where: {
			patientId,
			isActive: true,
			medication: {
				OR: [
					{ nameGeneric: { contains: args.medicationName, mode: "insensitive" } },
					{ nameBrand: { contains: args.medicationName, mode: "insensitive" } },
				],
			},
		},
		include: { medication: true, doseSchedules: true },
	});

	if (!prescription) {
		return {
			success: false,
			data: null,
			error: `"${args.medicationName}" adında aktif bir ilacınız bulunamadı.`,
		};
	}

	return {
		success: true,
		data: {
			medicationName: getMedicationDisplayName(prescription.medication),
			dosageAmount: prescription.dosageAmount,
			form: prescription.form,
			frequency: prescription.frequency,
			mealStatus: prescription.mealStatus,
			instructions: prescription.instructions,
			times: prescription.doseSchedules.map((ds) => ds.timeOfDay),
		},
	};
}

export async function handleGetMedicationDuration(
	patientId: string,
	args: { medicationName: string },
): Promise<ToolHandlerResult> {
	const prescription = await prisma.prescriptionMedication.findFirst({
		where: {
			patientId,
			isActive: true,
			medication: {
				OR: [
					{ nameGeneric: { contains: args.medicationName, mode: "insensitive" } },
					{ nameBrand: { contains: args.medicationName, mode: "insensitive" } },
				],
			},
		},
		include: { medication: true },
	});

	if (!prescription) {
		return {
			success: false,
			data: null,
			error: `"${args.medicationName}" adında aktif bir ilacınız bulunamadı.`,
		};
	}

	const startDate = new Date(prescription.startDate);
	const now = new Date();
	const daysSinceStart = Math.floor(
		(now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
	);

	const hasEndDate = prescription.endDate !== null;
	let daysRemaining: number | null = null;

	if (hasEndDate && prescription.endDate) {
		daysRemaining = Math.max(
			0,
			Math.ceil(
				(new Date(prescription.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
			),
		);
	}

	return {
		success: true,
		data: {
			medicationName: getMedicationDisplayName(prescription.medication),
			daysSinceStart,
			startDate: startDate.toISOString().split("T")[0],
			endDate: prescription.endDate
				? new Date(prescription.endDate).toISOString().split("T")[0]
				: null,
			daysRemaining,
		},
	};
}

export async function handleLogSideEffect(
	patientId: string,
	args: { description: string; medicationName?: string; severity?: string },
): Promise<ToolHandlerResult> {
	let prescriptionMedicationId: string | null = null;

	if (args.medicationName) {
		const prescription = await prisma.prescriptionMedication.findFirst({
			where: {
				patientId,
				isActive: true,
				medication: {
					OR: [
						{ nameGeneric: { contains: args.medicationName, mode: "insensitive" } },
						{ nameBrand: { contains: args.medicationName, mode: "insensitive" } },
					],
				},
			},
		});
		prescriptionMedicationId = prescription?.id ?? null;
	}

	const sideEffect = await prisma.sideEffect.create({
		data: {
			patientId,
			prescriptionMedicationId,
			description: args.description,
			severity: args.severity ?? null,
		},
	});

	return {
		success: true,
		data: {
			id: sideEffect.id,
			description: sideEffect.description,
			recorded: true,
		},
	};
}

export async function handleGetAdherenceSummary(
	patientId: string,
): Promise<ToolHandlerResult> {
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
	sevenDaysAgo.setHours(0, 0, 0, 0);

	const prescriptions = await prisma.prescriptionMedication.findMany({
		where: { patientId, isActive: true },
		include: {
			medication: true,
			doseSchedules: true,
			intakeEvents: {
				where: { takenAt: { gte: sevenDaysAgo } },
			},
		},
	});

	let totalExpected = 0;
	let totalTaken = 0;
	let totalSkipped = 0;
	let totalMissed = 0;

	for (const pm of prescriptions) {
		if (pm.frequency === "DAILY") {
			totalExpected += pm.doseSchedules.length * 7;
		}

		for (const event of pm.intakeEvents) {
			if (event.status === "TAKEN") totalTaken++;
			else if (event.status === "SKIPPED") totalSkipped++;
			else if (event.status === "MISSED") totalMissed++;
		}
	}

	const adherencePercentage =
		totalExpected > 0
			? Math.round((totalTaken / totalExpected) * 100)
			: 100;

	return {
		success: true,
		data: {
			periodDays: 7,
			totalExpectedDoses: totalExpected,
			takenDoses: totalTaken,
			skippedDoses: totalSkipped,
			missedDoses: totalMissed,
			adherencePercentage: Math.min(100, adherencePercentage),
		},
	};
}

export async function handleGetStockStatus(
	patientId: string,
	args: { medicationName?: string },
): Promise<ToolHandlerResult> {
	const prescriptions = await prisma.prescriptionMedication.findMany({
		where: {
			patientId,
			isActive: true,
			...(args.medicationName
				? {
						medication: {
							OR: [
								{ nameGeneric: { contains: args.medicationName, mode: "insensitive" } },
								{ nameBrand: { contains: args.medicationName, mode: "insensitive" } },
							],
						},
					}
				: {}),
		},
		include: { medication: true, doseSchedules: true },
	});

	const stockList = prescriptions.map((pm) => {
		const dailyDoses = pm.doseSchedules.length || 1;
		const daysRemaining = pm.currentStock > 0 ? Math.floor(pm.currentStock / dailyDoses) : 0;
		const isLowStock = pm.currentStock <= pm.restockThreshold;

		return {
			medicationName: getMedicationDisplayName(pm.medication),
			currentStock: pm.currentStock,
			restockThreshold: pm.restockThreshold,
			dailyDoses,
			estimatedDaysRemaining: daysRemaining,
			isLowStock,
		};
	});

	return { success: true, data: stockList };
}

export async function handleRecordMedicationIntake(
	patientId: string,
	args: { medicationName: string; status: "TAKEN" | "SKIPPED"; takenAt?: string },
): Promise<ToolHandlerResult> {
	const prescription = await prisma.prescriptionMedication.findFirst({
		where: {
			patientId,
			isActive: true,
			medication: {
				OR: [
					{ nameGeneric: { contains: args.medicationName, mode: "insensitive" } },
					{ nameBrand: { contains: args.medicationName, mode: "insensitive" } },
				],
			},
		},
		include: { medication: true, doseSchedules: true },
	});

	if (!prescription) {
		return {
			success: false,
			data: null,
			error: `"${args.medicationName}" adında aktif bir ilacınız bulunamadı.`,
		};
	}

	const takenAtDate = args.takenAt ? new Date(args.takenAt) : new Date();

	// Simple on-time logic: if it's within 1 hour of any schedule
	let isOnTime = false;
	const takenMinutes = takenAtDate.getHours() * 60 + takenAtDate.getMinutes();

	for (const schedule of prescription.doseSchedules) {
		const [h, m] = schedule.timeOfDay.split(":").map(Number);
		if (h !== undefined && m !== undefined) {
			const schedMinutes = h * 60 + m;
			if (Math.abs(takenMinutes - schedMinutes) <= 60) {
				isOnTime = true;
				break;
			}
		}
	}

	await prisma.intakeEvent.create({
		data: {
			prescriptionMedicationId: prescription.id,
			status: args.status,
			takenAt: takenAtDate,
			isOnTime,
		},
	});

	// Decrement stock if taken
	if (args.status === "TAKEN") {
		await prisma.prescriptionMedication.update({
			where: { id: prescription.id },
			data: { currentStock: { decrement: 1 } },
		});
	}

	return {
		success: true,
		data: {
			medicationName: getMedicationDisplayName(prescription.medication),
			status: args.status,
			takenAt: takenAtDate.toISOString(),
			isOnTime,
			currentStock: prescription.currentStock - (args.status === "TAKEN" ? 1 : 0),
		},
	};
}

// ─── Tool Dispatcher ──────────────────────────────────────────────────────────

export async function dispatchToolCall(
	toolName: string,
	args: Record<string, unknown>,
	patientId: string,
): Promise<ToolHandlerResult> {
	switch (toolName) {
		case "get_today_intake_status":
			return handleGetTodayIntakeStatus(patientId, args as { medicationName?: string });
		case "get_medication_list":
			return handleGetMedicationList(patientId);
		case "get_next_dose":
			return handleGetNextDose(patientId);
		case "get_medication_usage_info":
			return handleGetMedicationUsageInfo(patientId, args as { medicationName: string });
		case "get_medication_duration":
			return handleGetMedicationDuration(patientId, args as { medicationName: string });
		case "log_side_effect":
			return handleLogSideEffect(
				patientId,
				args as { description: string; medicationName?: string; severity?: string },
			);
		case "get_adherence_summary":
			return handleGetAdherenceSummary(patientId);
		case "get_stock_status":
			return handleGetStockStatus(patientId, args as { medicationName?: string });
		case "record_medication_intake":
			return handleRecordMedicationIntake(
				patientId,
				args as { medicationName: string; status: "TAKEN" | "SKIPPED"; takenAt?: string },
			);
		default:
			return { success: false, data: null, error: `Bilinmeyen araç: ${toolName}` };
	}
}
