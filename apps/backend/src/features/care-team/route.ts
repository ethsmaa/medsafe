/** biome-ignore-all lint/suspicious/noConsole: <explanation> */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../database/prisma.js";
import { protectedProcedure, router } from "../trpc/index.js";

export const careTeamRouter = router({
	/**
	 * Invite a patient to connect with the caregiver.
	 * Caregiver sends invite using patient's email.
	 */
	invitePatient: protectedProcedure
		.input(
			z.object({
				patientEmail: z.string().email(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const caregiverUser = ctx.user;

			// Ensure requester has a CaregiverProfile
			let caregiverProfile = await prisma.caregiverProfile.findUnique({
				where: { userId: caregiverUser.id },
			});

			if (!caregiverProfile) {
				// Create profile if missing (auto-onboard for now)
				caregiverProfile = await prisma.caregiverProfile.create({
					data: { userId: caregiverUser.id },
				});
			}

			// Find target patient
			const patientUser = await prisma.user.findUnique({
				where: { email: input.patientEmail },
				include: { patientProfile: true },
			});

			if (!patientUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Patient not found with this email.",
				});
			}

			// Ensure target has PatientProfile (or create one)
			let patientProfile = patientUser.patientProfile;
			if (!patientProfile) {
				patientProfile = await prisma.patientProfile.create({
					data: { userId: patientUser.id },
				});
			}

			// Check for existing connection
			const existingConnection = await prisma.careTeamMember.findUnique({
				where: {
					patientId_caregiverId: {
						patientId: patientProfile.id,
						caregiverId: caregiverProfile.id,
					},
				},
			});

			if (existingConnection) {
				if (existingConnection.status === "ACTIVE") {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Already connected to this patient.",
					});
				}
				if (existingConnection.status === "INVITED") {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Invitation already sent.",
					});
				}
				// If REJECTED, assume we can re-invite
				return await prisma.careTeamMember.update({
					where: { id: existingConnection.id },
					data: { status: "INVITED", initiatedBy: "CAREGIVER" },
				});
			}

			// Create new invitation
			return await prisma.careTeamMember.create({
				data: {
					caregiverId: caregiverProfile.id,
					patientId: patientProfile.id,
					status: "INVITED",
					initiatedBy: "CAREGIVER",
				},
			});
		}),

	/**
	 * Patient accepts or rejects an invitation.
	 */
	respondToInvite: protectedProcedure
		.input(
			z.object({
				inviteId: z.string(),
				status: z.enum(["ACTIVE", "REJECTED"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { inviteId, status } = input;
			const user = ctx.user;

			// Verify user is the patient for this invite
			const invite = await prisma.careTeamMember.findUnique({
				where: { id: inviteId },
				include: { patient: true },
			});

			if (!invite) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invitation not found.",
				});
			}

			if (invite.patient.userId !== user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to respond to this invitation.",
				});
			}

			return await prisma.careTeamMember.update({
				where: { id: inviteId },
				data: { status },
			});
		}),

	/**
	 * List invites RECEIVED by current user (Patient perspective).
	 * InitiatedBy: CAREGIVER
	 */
	getMyReceivedInvites: protectedProcedure.query(async ({ ctx }) => {
		const user = ctx.user;
		const patientProfile = await prisma.patientProfile.findUnique({
			where: { userId: user.id },
		});

		if (!patientProfile) return [];

		return await prisma.careTeamMember.findMany({
			where: {
				patientId: patientProfile.id,
				status: "INVITED",
				initiatedBy: "CAREGIVER",
			},
			include: {
				caregiver: {
					include: {
						user: {
							select: { name: true, image: true, email: true },
						},
					},
				},
			},
		});
	}),

	/**
	 * List invites SENT by current user (Patient perspective).
	 * InitiatedBy: PATIENT
	 */
	getMySentInvites: protectedProcedure.query(async ({ ctx }) => {
		const user = ctx.user;
		const patientProfile = await prisma.patientProfile.findUnique({
			where: { userId: user.id },
		});
		if (!patientProfile) return [];

		return await prisma.careTeamMember.findMany({
			where: {
				patientId: patientProfile.id,
				status: "INVITED",
				initiatedBy: "PATIENT",
			},
			include: {
				caregiver: {
					include: {
						user: {
							select: { name: true, image: true, email: true },
						},
					},
				},
			},
		});
	}),
	/**
	 * List invites RECEIVED by Caregiver (from Patient).
	 * InitiatedBy: PATIENT
	 */
	getCaregiverReceivedInvites: protectedProcedure.query(async ({ ctx }) => {
		const user = ctx.user;
		const caregiverProfile = await prisma.caregiverProfile.findUnique({
			where: { userId: user.id },
		});
		if (!caregiverProfile) return [];

		return await prisma.careTeamMember.findMany({
			where: {
				caregiverId: caregiverProfile.id,
				status: "INVITED",
				initiatedBy: "PATIENT",
			},
			include: {
				patient: {
					include: {
						user: {
							select: { name: true, image: true, email: true },
						},
					},
				},
			},
		});
	}),

	/**
	 * List active patients for the current caregiver.
	 */
	getMyPatients: protectedProcedure.query(async ({ ctx }) => {
		const user = ctx.user;

		const caregiverProfile = await prisma.caregiverProfile.findUnique({
			where: { userId: user.id },
		});

		if (!caregiverProfile) return [];

		return await prisma.careTeamMember.findMany({
			where: {
				caregiverId: caregiverProfile.id,
				status: "ACTIVE",
			},
			include: {
				patient: {
					include: {
						user: {
							select: { name: true, image: true, email: true },
						},
					},
				},
			},
		});
	}),

	/**
	 * Get details for a specific patient (Caregiver perspective).
	 */
	getPatientData: protectedProcedure
		.input(z.object({ patientId: z.string() }))
		.query(async ({ ctx, input }) => {
			try {
				console.log("[getPatientData] Input:", input);
				const user = ctx.user;
				console.log("[getPatientData] User:", user.id);

				// Verify caregiver has access
				const caregiverProfile = await prisma.caregiverProfile.findUnique({
					where: { userId: user.id },
				});

				if (!caregiverProfile) {
					console.error("[getPatientData] User is not a caregiver");
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "User is not a caregiver.",
					});
				}

				// Verify connection exists and is active
				const connection = await prisma.careTeamMember.findUnique({
					where: {
						patientId_caregiverId: {
							patientId: input.patientId,
							caregiverId: caregiverProfile.id,
						},
					},
				});

				console.log("[getPatientData] Connection:", connection);

				if (!connection || connection.status !== "ACTIVE") {
					console.error("[getPatientData] No active connection");
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You do not have access to this patient.",
					});
				}

				// Fetch patient data with medications
				const result = await prisma.patientProfile.findUnique({
					where: { id: input.patientId },
					include: {
						user: {
							select: { name: true, email: true, image: true },
						},
						prescriptions: {
							where: { isActive: true },
							include: {
								medication: true,
							},
						},
					},
				});

				console.log("[getPatientData] Result found:", !!result);
				return result;
			} catch (e) {
				console.error("[getPatientData] Error:", e);
				throw e;
			}
		}),

	/**
	 * Get list of active caregivers for the current patient.
	 */
	getMyCaregivers: protectedProcedure.query(async ({ ctx }) => {
		const user = ctx.user;
		const patientProfile = await prisma.patientProfile.findUnique({
			where: { userId: user.id },
		});
		if (!patientProfile) return [];

		return await prisma.careTeamMember.findMany({
			where: {
				patientId: patientProfile.id,
				status: "ACTIVE",
			},
			include: {
				caregiver: {
					include: {
						user: {
							select: { name: true, image: true, email: true },
						},
					},
				},
			},
		});
	}),

	/**
	 * Patient invites a caregiver by email.
	 */
	inviteCaregiver: protectedProcedure
		.input(z.object({ email: z.string().email() }))
		.mutation(async ({ ctx, input }) => {
			const user = ctx.user;
			let patientProfile = await prisma.patientProfile.findUnique({
				where: { userId: user.id },
			});

			if (!patientProfile) {
				patientProfile = await prisma.patientProfile.create({
					data: { userId: user.id },
				});
			}

			// Find target caregiver user
			const caregiverUser = await prisma.user.findUnique({
				where: { email: input.email },
				include: { caregiverProfile: true },
			});

			if (!caregiverUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Caregiver not found with this email.",
				});
			}

			// Ensure target has CaregiverProfile
			let caregiverProfile = caregiverUser.caregiverProfile;
			if (!caregiverProfile) {
				caregiverProfile = await prisma.caregiverProfile.create({
					data: { userId: caregiverUser.id },
				});
			}

			// Check relation
			const existing = await prisma.careTeamMember.findUnique({
				where: {
					patientId_caregiverId: {
						patientId: patientProfile.id,
						caregiverId: caregiverProfile.id,
					},
				},
			});

			if (existing) {
				if (existing.status === "ACTIVE") {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Already connected.",
					});
				}
				return await prisma.careTeamMember.update({
					where: { id: existing.id },
					data: { status: "INVITED", initiatedBy: "PATIENT" },
				});
			}

			return await prisma.careTeamMember.create({
				data: {
					patientId: patientProfile.id,
					caregiverId: caregiverProfile.id,
					status: "INVITED",
					initiatedBy: "PATIENT",
				},
			});
		}),
});
