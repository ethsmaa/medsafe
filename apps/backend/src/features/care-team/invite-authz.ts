/**
 * Authorization rules for responding to care-team invitations.
 *
 * An invitation is always created by one side and answered by the other.
 * Only the *recipient* (the party that did not initiate the invite) is
 * allowed to accept or reject it.
 */

export type InviteParties = {
	/** "PATIENT" or "CAREGIVER" — which side created the invitation. */
	initiatedBy: string;
	/** userId behind the PatientProfile on the invitation. */
	patientUserId: string;
	/** userId behind the CaregiverProfile on the invitation. */
	caregiverUserId: string;
};

/**
 * Returns true when `userId` is the recipient of the invitation and may
 * therefore respond to it.
 *
 * - Caregiver-initiated invite  -> the patient is the recipient.
 * - Patient-initiated invite    -> the caregiver is the recipient.
 */
export function canRespondToInvite(
	invite: InviteParties,
	userId: string,
): boolean {
	if (invite.initiatedBy === "CAREGIVER") {
		return invite.patientUserId === userId;
	}
	if (invite.initiatedBy === "PATIENT") {
		return invite.caregiverUserId === userId;
	}
	return false;
}
