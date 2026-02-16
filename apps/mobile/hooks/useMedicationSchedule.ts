import { useMemo } from "react";

export interface ScheduleItem {
	id: string;
	medication: {
		name: string;
		nameGeneric?: string;
		dosage?: string;
		instructions?: string;
	};
	prescriptionMedicationId: string;
	timeOfDay: string;
	doseMinutes: number;
	form?: string;
	instructions?: string;
	mealStatus?: string;
	taken: boolean;
	genericName: string;
	dosage: string;
	status?: "TAKEN" | "SKIPPED" | "PENDING"; // Add status for UI clarity
	scheduledTime: string; // ISO string for date-fns
}

export const useMedicationSchedule = (cabinetData: any[]) => {
	return useMemo(() => {
		if (!cabinetData) return { nextDose: null, schedule: [], flexibleItems: [] };

		const now = new Date();
		let schedule: ScheduleItem[] = [];
		let flexibleItems: ScheduleItem[] = [];

		cabinetData.forEach((med) => {
			// Filter by Frequency (Simple Logic)
			if (med.frequency === "WEEKLY") {
				// Use startDate instead of createdAt for true user intent
				const start = new Date(med.startDate || med.createdAt);
				if (start.getDay() !== now.getDay()) {
					return; // Skip if not the right day of week
				}
			}

			// @ts-ignore
			const schedules = med.doseSchedules || [];

			if (schedules.length === 0) {
				// Handle "No Time" / As Needed medications -> Flexible List
				flexibleItems.push({
					id: `${med.id}-any-time`,
					medication: med.medication,
					prescriptionMedicationId: med.id,
					timeOfDay: "Any Time", // Placeholder
					doseMinutes: 9999, // Irrelevant
					form: med.form,
					instructions: med.instructions,
					mealStatus: med.mealStatus,
					taken: false, // Will be updated below
					genericName: med.medication?.nameGeneric || "Medication",
					dosage: med.dosageAmount,
					status: "PENDING",
					scheduledTime: new Date().toISOString(), // Default to now for ease
				});
			} else {
				schedules.forEach((msg: any) => {
					const [h, m] = msg.timeOfDay.split(":").map(Number);
					const doseMinutes = h * 60 + m;
                    
                    // Create date for today at this time
                    const scheduledDate = new Date(now);
                    scheduledDate.setHours(h, m, 0, 0);

					schedule.push({
						id: `${med.id}-${msg.timeOfDay}`,
						medication: med.medication,
						prescriptionMedicationId: med.id,
						timeOfDay: msg.timeOfDay,
						doseMinutes,
						form: med.form,
						instructions: med.instructions,
						mealStatus: med.mealStatus,
						taken: false, // initial
						genericName: med.medication?.nameGeneric || "Medication",
						dosage: med.dosageAmount,
						status: "PENDING",
						scheduledTime: scheduledDate.toISOString(),
					});
				});
			}
		});

		// Sort by time
		schedule.sort((a, b) => a.doseMinutes - b.doseMinutes);

		// Apply "Taken" status based on generic counts
		const takenCounts: Record<string, number> = {};
		cabinetData.forEach((med) => {
			// @ts-ignore
			takenCounts[med.id] = (med.intakeEvents || []).length;
		});

		const applyTakenStatus = (list: ScheduleItem[]) => {
			return list.map((item) => {
				const takenCount = takenCounts[item.prescriptionMedicationId] || 0;
				if (takenCount > 0) {
					takenCounts[item.prescriptionMedicationId]--;
					return { ...item, taken: true, status: "TAKEN" as const };
				}
				return { ...item, taken: false, status: "PENDING" as const };
			});
		};

		schedule = applyTakenStatus(schedule);
		flexibleItems = applyTakenStatus(flexibleItems);

		// Find Next Dose (First not taken from STRICT schedule only)
		const nextDose = schedule.find((s) => !s.taken) || null;

		return { nextDose, schedule, flexibleItems };
	}, [cabinetData]);
};
