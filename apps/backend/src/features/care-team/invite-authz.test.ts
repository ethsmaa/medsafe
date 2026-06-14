import { describe, expect, it } from "vitest";
import { canRespondToInvite } from "./invite-authz.js";

const PARTIES = {
	initiatedBy: "CAREGIVER",
	patientUserId: "patient-user-1",
	caregiverUserId: "caregiver-user-1",
};

describe("canRespondToInvite", () => {
	it("lets the patient respond to a caregiver-initiated invite", () => {
		expect(canRespondToInvite(PARTIES, "patient-user-1")).toBe(true);
	});

	it("does not let the caregiver respond to their own invite", () => {
		expect(canRespondToInvite(PARTIES, "caregiver-user-1")).toBe(false);
	});

	it("lets the caregiver respond to a patient-initiated invite", () => {
		expect(
			canRespondToInvite(
				{ ...PARTIES, initiatedBy: "PATIENT" },
				"caregiver-user-1",
			),
		).toBe(true);
	});

	it("does not let the patient respond to their own invite", () => {
		expect(
			canRespondToInvite(
				{ ...PARTIES, initiatedBy: "PATIENT" },
				"patient-user-1",
			),
		).toBe(false);
	});

	it("rejects an unrelated user", () => {
		expect(canRespondToInvite(PARTIES, "someone-else")).toBe(false);
	});

	it("rejects an unknown initiatedBy value", () => {
		expect(
			canRespondToInvite(
				{ ...PARTIES, initiatedBy: "ROBOT" },
				"patient-user-1",
			),
		).toBe(false);
	});
});
