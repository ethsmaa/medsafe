import { TRPCError } from "@trpc/server";
import { prisma } from "../database/prisma.js";

/**
 * Resolves the target patient ID based on the authenticated user and optional input.
 *
 * - If `inputPatientId` is provided, verifies the user is a caregiver with an active relationship.
 * - Otherwise, looks up (or optionally creates) the patient profile for the current user.
 *
 * @param userId - The authenticated user's ID
 * @param inputPatientId - Optional patient ID (provided when a caregiver acts on behalf of a patient)
 * @param options.autoCreate - If true, auto-creates a patient profile if one doesn't exist (default: false)
 * @returns The resolved patient ID string
 */
export async function resolveTargetPatient(
	userId: string,
	inputPatientId?: string,
	options: { autoCreate?: boolean } = {},
): Promise<string> {
	if (inputPatientId) {
		// Caregiver flow — verify relationship
		const caregiver = await prisma.caregiverProfile.findUnique({
			where: { userId },
		});

		if (!caregiver) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Only caregivers can act on behalf of patients.",
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

		return inputPatientId;
	}

	// Self flow — look up own patient profile
	let patient = await prisma.patientProfile.findUnique({
		where: { userId },
	});

	if (!patient && options.autoCreate) {
		patient = await prisma.patientProfile.create({
			data: { userId },
		});
	}

	if (!patient) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Patient profile not found.",
		});
	}

	return patient.id;
}
