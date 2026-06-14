/**
 * Resolves which side is the patient and which is the caregiver when two
 * users connect via a shareable code. A valid connection always pairs one
 * patient with one caregiver.
 */

export type RolePresence = {
	isPatient: boolean;
	isCaregiver: boolean;
};

export type ConnectResolution =
	| { ok: true; patient: "me" | "target" }
	| { ok: false; reason: string };

type Role = "PATIENT" | "CAREGIVER" | null;

function roleOf(p: RolePresence): Role {
	// A user picks a single role at onboarding; prefer caregiver if somehow both.
	if (p.isCaregiver) return "CAREGIVER";
	if (p.isPatient) return "PATIENT";
	return null;
}

/**
 * `me` is the user redeeming the code; `target` is the code owner.
 */
export function resolveConnectionRoles(
	me: RolePresence,
	target: RolePresence,
): ConnectResolution {
	const meRole = roleOf(me);
	const targetRole = roleOf(target);

	if (meRole === null) {
		return {
			ok: false,
			reason: "Finish choosing your role before connecting.",
		};
	}
	if (targetRole === null) {
		return {
			ok: false,
			reason: "This user has not finished setting up their account.",
		};
	}
	if (meRole === targetRole) {
		const noun = meRole === "PATIENT" ? "patients" : "caregivers";
		return {
			ok: false,
			reason: `You are both ${noun}; a patient must connect with a caregiver.`,
		};
	}

	return { ok: true, patient: meRole === "PATIENT" ? "me" : "target" };
}
