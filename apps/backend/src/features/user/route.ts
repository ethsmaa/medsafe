import { z } from "zod";
import { prisma } from "../database/prisma.js";
import { protectedProcedure, router } from "../trpc/index.js";

export const userRouter = router({
	/**
	 * Get the current user's role and profile status.
	 */
	getProfile: protectedProcedure
		.input(z.object({ userId: z.string().optional() }))
		.query(async ({ ctx }) => {
		const user = ctx.user;

		const patientProfile = await prisma.patientProfile.findUnique({
			where: { userId: user.id },
		});

		if (patientProfile) {
			return { role: "PATIENT" as const, profileId: patientProfile.id };
		}

		const caregiverProfile = await prisma.caregiverProfile.findUnique({
			where: { userId: user.id },
		});

		if (caregiverProfile) {
			return { role: "CAREGIVER" as const, profileId: caregiverProfile.id };
		}

		return { role: null, profileId: null };
	}),

	/**
	 * Setup the user's role (Onboarding).
	 */
	setupRole: protectedProcedure
		.input(
			z.object({
				role: z.enum(["PATIENT", "CAREGIVER"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const user = ctx.user;
			const { role } = input;

			// Check if already has a profile to prevent overwriting/duplicates logic if needed
			// For this mvp, strictly create if not exists
			if (role === "PATIENT") {
				const existing = await prisma.patientProfile.findUnique({
					where: { userId: user.id },
				});
				if (existing) return { success: true, role: "PATIENT" };

				await prisma.patientProfile.create({
					data: { userId: user.id },
				});
				return { success: true, role: "PATIENT" };
			} else {
				const existing = await prisma.caregiverProfile.findUnique({
					where: { userId: user.id },
				});
				if (existing) return { success: true, role: "CAREGIVER" };

				await prisma.caregiverProfile.create({
					data: { userId: user.id },
				});
				return { success: true, role: "CAREGIVER" };
			}
		}),
});
