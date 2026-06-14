import { TRPCError } from "@trpc/server";
import { prisma } from "../database/prisma.js";

/**
 * Throws FORBIDDEN unless `userId` is allowed to manage the given patient's
 * data: either they ARE that patient, or they are a caregiver with an ACTIVE
 * care-team relationship to that patient.
 *
 * @param userId    the authenticated user's id
 * @param patientId the PatientProfile id being acted on
 */
export async function assertCanManagePatient(
	userId: string,
	patientId: string,
): Promise<void> {
	const patient = await prisma.patientProfile.findUnique({
		where: { id: patientId },
		select: { userId: true },
	});

	// The patient acting on their own data.
	if (patient?.userId === userId) return;

	// A caregiver acting on a patient they are actively linked to.
	const caregiver = await prisma.caregiverProfile.findUnique({
		where: { userId },
		select: { id: true },
	});

	if (caregiver) {
		const relation = await prisma.careTeamMember.findUnique({
			where: {
				patientId_caregiverId: { patientId, caregiverId: caregiver.id },
			},
			select: { status: true },
		});
		if (relation?.status === "ACTIVE") return;
	}

	throw new TRPCError({
		code: "FORBIDDEN",
		message: "You do not have access to this patient.",
	});
}
