import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../database/prisma.js";
import { protectedProcedure, router } from "../trpc/index.js";

export const medicationRouter = router({
	/**
	 * Add a medication manually (Patient or Caregiver for active patient).
	 */
	addMedicationManual: protectedProcedure
		.input(
			z.object({
				patientId: z.string().optional(), // If not provided, assumes self
				nameGeneric: z.string().min(1),
				dosageAmount: z.string().min(1),
				frequency: z.enum(["DAILY", "WEEKLY", "AS_NEEDED", "PERIODIC"]),
				currentStock: z.number().min(0).default(0),
				restockThreshold: z.number().min(0).default(5),
				instructions: z.string().optional(),
				form: z.enum([
					"TABLET",
					"CAPSULE",
					"SYRUP",
					"CREAM",
					"INJECTION",
					"OTHER",
				]),
				mealStatus: z.enum(["BEFORE_MEAL", "AFTER_MEAL", "WITH_FOOD", "ANY"]),
				times: z.array(z.string()), // Array of "HH:mm" strings
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const {
				patientId: inputPatientId,
				nameGeneric,
				dosageAmount,
				frequency,
				currentStock,
				restockThreshold,
				instructions,
				form,
				mealStatus,
				times,
			} = input;
			const user = ctx.user;

			let targetPatientId = "";

			if (inputPatientId) {
				// Caregiver adding for patient
				// Verify relationship
				const caregiver = await prisma.caregiverProfile.findUnique({
					where: { userId: user.id },
				});

				if (!caregiver) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Only caregivers can add medications for others.",
					});
				}

				const relation = await prisma.careTeamMember.findUnique({
					where: {
						patientId_caregiverId: {
							patientId: inputPatientId,
							caregiverId: caregiver.id,
						},
					},
				});

				if (!relation || relation.status !== "ACTIVE") {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "No active care relationship with this patient.",
					});
				}

				targetPatientId = inputPatientId;
			} else {
				// Adding for self
				let patientProfile = await prisma.patientProfile.findUnique({
					where: { userId: user.id },
				});

				if (!patientProfile) {
					// Auto-create patient profile
					patientProfile = await prisma.patientProfile.create({
						data: { userId: user.id },
					});
				}
				targetPatientId = patientProfile.id;
			}

			// Create Medication record (if not exists - usually we'd search first but strictly manual now)
			let medication = await prisma.medication.findFirst({
				where: { nameGeneric: { equals: nameGeneric, mode: "insensitive" } },
			});

			if (!medication) {
				medication = await prisma.medication.create({
					data: { nameGeneric },
				});
			}

			// Create PrescriptionMedication entry (The "Stock" record)
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

			// Create Dose Schedules
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
				patientId: z.string().optional(), // Caregiver can view specific patient
			}),
		)
		.query(async ({ ctx, input }) => {
			const user = ctx.user;
			let targetPatientId = "";

			if (input.patientId) {
				// Check RBAC for Caregiver
				const caregiver = await prisma.caregiverProfile.findUnique({
					where: { userId: user.id },
				});
				if (!caregiver) {
					throw new TRPCError({ code: "FORBIDDEN" });
				}
				const relation = await prisma.careTeamMember.findUnique({
					where: {
						patientId_caregiverId: {
							patientId: input.patientId,
							caregiverId: caregiver.id,
						},
					},
				});
				if (!relation || relation.status !== "ACTIVE") {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Access denied to patient cabinet.",
					});
				}
				targetPatientId = input.patientId;
			} else {
				// Own cabinet
				const patient = await prisma.patientProfile.findUnique({
					where: { userId: user.id },
				});
				if (!patient) return [];
				targetPatientId = patient.id;
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
                                lte: todayEnd
                            }
                        }
                    }
				},
				orderBy: { createdAt: "desc" },
			});
		}),

	/**
	 * Confirm intake of a medication.
	 * Decrements stock and records the event.
	 */
	confirmIntake: protectedProcedure
		.input(
			z.object({
				prescriptionMedicationId: z.string(),
				status: z.enum(["TAKEN", "SKIPPED"]),
				isLowStock: z.boolean().optional(), // Just a flag for UI feedback, logic handled here
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { prescriptionMedicationId, status } = input;

			// Verify ownership logic omitted for brevity (should ideally check patient owns this script)

			return await prisma.$transaction(async (tx) => {
				// 1. Record Event
				const event = await tx.intakeEvent.create({
					data: {
						prescriptionMedicationId,
						status,
						isOnTime: true, // Simplified logic for "Take Now"
					},
				});

				// 2. Decrement Stock if TAKEN
				let updatedPm = null;
				let isLowStock = false;
				if (status === "TAKEN") {
					updatedPm = await tx.prescriptionMedication.update({
						where: { id: prescriptionMedicationId },
						data: {
							currentStock: {
								decrement: 1, // Assuming 1 unit per intake for now
							},
						},
						include: { medication: true },
					});

					// 3. Check Threshold
					if (updatedPm.currentStock <= updatedPm.restockThreshold) {
						isLowStock = true;
						// TODO: Trigger Notification/Alert here in future
					}
				}

				return { event, updatedStock: updatedPm?.currentStock, isLowStock, medicationName: updatedPm?.medication.nameGeneric };
			});
		}),

	/**
	 * Get Adherence Stats for Today.
	 */
	getAdherenceStats: protectedProcedure.query(async ({ ctx }) => {
		const user = ctx.user;
		const patient = await prisma.patientProfile.findUnique({
			where: { userId: user.id },
		});
		if (!patient) return { percentage: 0, takenCount: 0, totalScheduled: 0 };

		// Simplified adherence:
		// Total scheduled doses for today vs Total TAKEN events today.
		// Note: This is an approximation. Real logic needs accurate schedule parsing.

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

		// Rough estimate of "Scheduled" count: Sum of doseSchedules for active meds
		// Correct way: Only count schedules that actually occur today (e.g. if weekly)
		const activeMeds = await prisma.prescriptionMedication.findMany({
			where: { patientId: patient.id, isActive: true },
			include: { doseSchedules: true },
		});

		let totalScheduled = 0;
		for (const med of activeMeds) {
			if (med.frequency === "DAILY") {
				totalScheduled += med.doseSchedules.length;
			}
			// Add logic for other frequencies if needed
		}

		if (totalScheduled === 0) return { percentage: 100, takenCount: events.length, totalScheduled: 0 };

		// Cap at 100% if extra doses taken
		const percentage = Math.min(
			100,
			Math.round((events.length / totalScheduled) * 100),
		);

		return { percentage, takenCount: events.length, totalScheduled };
	}),

    /**
     * Get Log for a Specific Date
     */
    getDayLog: protectedProcedure
        .input(z.object({
            date: z.string(), // ISO Date string (YYYY-MM-DD or full ISO)
            patientId: z.string().optional()
        }))
        .query(async ({ ctx, input }) => {
            const user = ctx.user;
			let targetPatientId = "";

			if (input.patientId) {
                // Caregiver logic (omitted for brevity, same as getMyCabinet)
                // For now assuming self
                const patient = await prisma.patientProfile.findUnique({ where: { userId: user.id } });
                if(!patient) throw new TRPCError({ code: "NOT_FOUND"});
                targetPatientId = patient.id;
			} else {
				const patient = await prisma.patientProfile.findUnique({
					where: { userId: user.id },
				});
				if (!patient) return [];
				targetPatientId = patient.id;
			}

            const queryDate = new Date(input.date);
            const startOfDay = new Date(queryDate);
            startOfDay.setHours(0,0,0,0);
            const endOfDay = new Date(queryDate);
            endOfDay.setHours(23,59,59,999);

            return await prisma.prescriptionMedication.findMany({
				where: {
					patientId: targetPatientId,
					isActive: true, // Only showing active meds for now
				},
				include: {
					medication: true,
					doseSchedules: true,
                    intakeEvents: {
                        where: {
                            takenAt: {
                                gte: startOfDay,
                                lte: endOfDay
                            }
                        }
                    }
				},
				orderBy: { createdAt: "desc" },
			});
        }),
});
