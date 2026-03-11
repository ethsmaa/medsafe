import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../database/prisma.js";
import { protectedProcedure, router } from "../trpc/index.js";
import { MEDICATION_FORMS, MEDICATION_FREQUENCIES, MEAL_STATUSES } from "./constants.js";
import { resolveTargetPatient } from "./resolve-patient.js";
import { scanMedicationImage } from "./scan-medication.js";
import { generateMedicationNote } from "./generate-note.js";

export const medicationRouter = router({
	/**
	 * Scan a medication box image using AI (Gemini Vision).
	 */
	scanBox: protectedProcedure
		.input(
			z.object({
				imageBase64: z.string().min(1, "Image data is required"),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				return await scanMedicationImage(input.imageBase64);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error
							? error.message
							: "Failed to scan medication image",
				});
			}
		}),

	/**
	 * Generate an AI-powered, elderly-friendly medication note.
	 * Fetches prospectus data from OpenFDA, then summarises it with Gemini.
	 */
	generateNote: protectedProcedure
		.input(
			z.object({
				drugName: z.string().min(1, "Drug name is required"),
				language: z.enum(["en", "tr"]).default("en"),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				const result = await generateMedicationNote(input.drugName, input.language);
				return result; // { note: string; source: "fda" | "ai_only" }
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error
							? error.message
							: "Failed to generate medication note",
				});
			}
		}),

	addMedicationManual: protectedProcedure
		.input(
			z.object({
				patientId: z.string().optional(),
				nameGeneric: z.string().optional(),
				nameBrand: z.string().optional(),
				dosageAmount: z.string().min(1),
				frequency: z.enum(MEDICATION_FREQUENCIES),
				currentStock: z.number().min(0).default(0),
				restockThreshold: z.number().min(0).default(5),
				instructions: z.string().optional(),
				form: z.enum(MEDICATION_FORMS),
				mealStatus: z.enum(MEAL_STATUSES),
				times: z.array(z.string()),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const {
				patientId: inputPatientId,
				nameGeneric,
				nameBrand,
				dosageAmount,
				frequency,
				currentStock,
				restockThreshold,
				instructions,
				form,
				mealStatus,
				times,
			} = input;

			const targetPatientId = await resolveTargetPatient(
				ctx.user.id,
				inputPatientId,
				{ autoCreate: true },
			);

			// Create Medication record (if not exists)
			const searchName = nameGeneric || nameBrand;
			if (!searchName) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Either generic name or brand name is required.",
				});
			}

			let medication = nameGeneric
				? await prisma.medication.findFirst({
						where: { nameGeneric: { equals: nameGeneric, mode: "insensitive" } },
					})
				: await prisma.medication.findFirst({
						where: { nameBrand: { equals: nameBrand, mode: "insensitive" } },
					});

			if (!medication) {
				medication = await prisma.medication.create({
					data: {
						nameGeneric: nameGeneric ?? nameBrand ?? "",
						nameBrand,
					},
				});
			} else if (nameBrand && !medication.nameBrand) {
				medication = await prisma.medication.update({
					where: { id: medication.id },
					data: { nameBrand },
				});
			}

			const pm = await prisma.prescriptionMedication.create({
				data: {
					patientId: targetPatientId,
					medicationId: medication.id,
					dosageAmount,
					frequency,
					instructions,
					currentStock,
					restockThreshold,
					form,
					mealStatus,
					isActive: true,
				},
			});

			if (times && times.length > 0) {
				await prisma.doseSchedule.createMany({
					data: times.map((time) => ({
						prescriptionMedicationId: pm.id,
						timeOfDay: time,
					})),
				});
			}

			return pm;
		}),

	/**
	 * Get the medication cabinet.
	 */
	getMyCabinet: protectedProcedure
		.input(
			z.object({
				patientId: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			let targetPatientId: string;
			try {
				targetPatientId = await resolveTargetPatient(ctx.user.id, input.patientId);
			} catch {
				return []; // No patient profile found — return empty cabinet
			}

			const todayStart = new Date();
			todayStart.setHours(0, 0, 0, 0);
			const todayEnd = new Date();
			todayEnd.setHours(23, 59, 59, 999);

			return await prisma.prescriptionMedication.findMany({
				where: {
					patientId: targetPatientId,
					isActive: true,
				},
				include: {
					medication: true,
					doseSchedules: true,
					intakeEvents: {
						where: {
							takenAt: {
								gte: todayStart,
								lte: todayEnd,
							},
						},
					},
				},
				orderBy: { createdAt: "desc" },
			});
		}),

	/**
	 * Confirm intake of a medication.
	 */
	confirmIntake: protectedProcedure
		.input(
			z.object({
				prescriptionMedicationId: z.string(),
				status: z.enum(["TAKEN", "SKIPPED"]),
			}),
		)
		.mutation(async ({ input }) => {
			const { prescriptionMedicationId, status } = input;

			return await prisma.$transaction(async (tx) => {
				// Compute isOnTime: within 30 min of the nearest scheduled dose
				const pm = await tx.prescriptionMedication.findUnique({
					where: { id: prescriptionMedicationId },
					include: { doseSchedules: true },
				});

				const now = new Date();
				let isOnTime = true;
				let minutesDelta = 0;

				if (pm?.doseSchedules && pm.doseSchedules.length > 0) {
					const nowMinutes = now.getHours() * 60 + now.getMinutes();
					const deltas = pm.doseSchedules.map((s) => {
						const parts = s.timeOfDay.split(":").map(Number);
						const scheduled = (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
						return Math.abs(nowMinutes - scheduled);
					});
					minutesDelta = Math.min(...deltas);
					isOnTime = minutesDelta <= 30; // within 30 minutes = on time
				}

				const event = await tx.intakeEvent.create({
					data: {
						prescriptionMedicationId,
						status,
						isOnTime,
						// Store delta in minutes using the notes field is not possible,
						// so we rely on the frontend to compute the display label
					},
				});

				let updatedPm = null;
				let isLowStock = false;
				if (status === "TAKEN") {
					// Only decrement if there is stock to take (prevents going negative)
					updatedPm = await tx.prescriptionMedication.update({
						where: { id: prescriptionMedicationId },
						data: {
							currentStock: pm?.currentStock && pm.currentStock > 0
								? { decrement: 1 }
								: undefined,
						},
						include: { medication: true },
					});

					if (updatedPm.currentStock <= updatedPm.restockThreshold) {
						isLowStock = true;
					}
				}

				return {
					event,
					minutesDelta,
					updatedStock: updatedPm?.currentStock,
					isLowStock,
					medicationName: updatedPm?.medication.nameGeneric,
				};
			});
		}),

	/**
	 * Get Adherence Stats for Today.
	 */
	getAdherenceStats: protectedProcedure.query(async ({ ctx }) => {
		const patient = await prisma.patientProfile.findUnique({
			where: { userId: ctx.user.id },
		});
		if (!patient) return { percentage: 0, takenCount: 0, totalScheduled: 0 };

		const todayStart = new Date();
		todayStart.setHours(0, 0, 0, 0);
		const todayEnd = new Date();
		todayEnd.setHours(23, 59, 59, 999);

		const events = await prisma.intakeEvent.findMany({
			where: {
				prescriptionMedication: { patientId: patient.id },
				takenAt: { gte: todayStart, lte: todayEnd },
				status: "TAKEN",
			},
		});

		const activeMeds = await prisma.prescriptionMedication.findMany({
			where: { patientId: patient.id, isActive: true },
			include: { doseSchedules: true },
		});

		let totalScheduled = 0;
		for (const med of activeMeds) {
			if (med.frequency === "DAILY") {
				totalScheduled += med.doseSchedules.length;
			}
		}

		if (totalScheduled === 0) return { percentage: 100, takenCount: events.length, totalScheduled: 0 };

		const percentage = Math.min(
			100,
			Math.round((events.length / totalScheduled) * 100),
		);

		return { percentage, takenCount: events.length, totalScheduled };
	}),

	/**
	 * Get Log for a Specific Date.
	 */
	getDayLog: protectedProcedure
		.input(
			z.object({
				date: z.string(),
				patientId: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			let targetPatientId: string;
			try {
				targetPatientId = await resolveTargetPatient(ctx.user.id, input.patientId);
			} catch {
				return [];
			}

			const queryDate = new Date(input.date);
			const startOfDay = new Date(queryDate);
			startOfDay.setHours(0, 0, 0, 0);
			const endOfDay = new Date(queryDate);
			endOfDay.setHours(23, 59, 59, 999);

			return await prisma.prescriptionMedication.findMany({
				where: {
					patientId: targetPatientId,
					isActive: true,
				},
				include: {
					medication: true,
					doseSchedules: true,
					intakeEvents: {
						where: {
							takenAt: {
								gte: startOfDay,
								lte: endOfDay,
							},
						},
					},
				},
				orderBy: { createdAt: "desc" },
			});
		}),

	/**
	 * Soft delete a medication.
	 */
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			const pm = await prisma.prescriptionMedication.findUnique({
				where: { id },
				include: { patient: true },
			});

			if (!pm) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Medication not found",
				});
			}

			if (pm.patient.userId !== ctx.user.id) {
				const caregiver = await prisma.caregiverProfile.findUnique({
					where: { userId: ctx.user.id },
				});
				if (!caregiver) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You do not have permission to delete this medication.",
					});
				}
			}

			return await prisma.prescriptionMedication.update({
				where: { id },
				data: { isActive: false },
			});
		}),

	/**
	 * Delete multiple medications.
	 */
	deleteMany: protectedProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ ctx, input }) => {
			const { ids } = input;

			// Verify all belong to user or caregiver has access
			const medications = await prisma.prescriptionMedication.findMany({
				where: { id: { in: ids } },
				include: { patient: true },
			});

			for (const pm of medications) {
				if (pm.patient.userId !== ctx.user.id) {
					const caregiver = await prisma.caregiverProfile.findUnique({
						where: { userId: ctx.user.id },
					});
					if (!caregiver) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "You do not have permission to delete these medications.",
						});
					}
				}
			}

			return await prisma.prescriptionMedication.updateMany({
				where: { id: { in: ids } },
				data: { isActive: false },
			});
		}),

	/**
	 * Update a medication.
	 */
	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				dosageAmount: z.string().optional(),
				frequency: z.enum(MEDICATION_FREQUENCIES).optional(),
				currentStock: z.number().min(0).optional(),
				restockThreshold: z.number().min(0).optional(),
				instructions: z.string().optional(),
				form: z.enum(MEDICATION_FORMS).optional(),
				mealStatus: z.enum(MEAL_STATUSES).optional(),
				times: z.array(z.string()).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, times, ...updates } = input;

			const pm = await prisma.prescriptionMedication.findUnique({
				where: { id },
				include: { patient: true },
			});

			if (!pm) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Medication not found",
				});
			}

			if (pm.patient.userId !== ctx.user.id) {
				const caregiver = await prisma.caregiverProfile.findUnique({
					where: { userId: ctx.user.id },
				});
				if (!caregiver) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You do not have permission to update this medication.",
					});
				}
			}

			return await prisma.$transaction(async (tx) => {
				const updatedPm = await tx.prescriptionMedication.update({
					where: { id },
					data: { ...updates },
				});

				if (times !== undefined) {
					await tx.doseSchedule.deleteMany({
						where: { prescriptionMedicationId: id },
					});

					if (times.length > 0) {
						await tx.doseSchedule.createMany({
							data: times.map((time) => ({
								prescriptionMedicationId: id,
								timeOfDay: time,
							})),
						});
					}
				}

				return updatedPm;
			});
		}),
});
