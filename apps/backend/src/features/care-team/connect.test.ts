import { describe, expect, it } from "vitest";
import {
	CONNECT_CODE_ALPHABET,
	CONNECT_CODE_LENGTH,
	codeFromBytes,
	normalizeConnectCode,
} from "./connect-code.js";
import { resolveConnectionRoles } from "./connect-roles.js";

describe("codeFromBytes", () => {
	it("produces a code of the fixed length", () => {
		const code = codeFromBytes(new Uint8Array(CONNECT_CODE_LENGTH));
		expect(code).toHaveLength(CONNECT_CODE_LENGTH);
	});

	it("is deterministic for the same bytes", () => {
		const bytes = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]);
		expect(codeFromBytes(bytes)).toBe(codeFromBytes(bytes));
	});

	it("maps all-zero bytes to the first alphabet character", () => {
		expect(codeFromBytes(new Uint8Array(CONNECT_CODE_LENGTH))).toBe(
			CONNECT_CODE_ALPHABET.charAt(0).repeat(CONNECT_CODE_LENGTH),
		);
	});

	it("only uses unambiguous characters (no 0/O/1/I/L)", () => {
		expect(CONNECT_CODE_ALPHABET).not.toMatch(/[01OIL]/);
	});
});

describe("normalizeConnectCode", () => {
	it("trims and uppercases", () => {
		expect(normalizeConnectCode("  k7p2qxm9 ")).toBe("K7P2QXM9");
	});
});

describe("resolveConnectionRoles", () => {
	const patient = { isPatient: true, isCaregiver: false };
	const caregiver = { isPatient: false, isCaregiver: true };
	const none = { isPatient: false, isCaregiver: false };

	it("pairs a redeeming patient with a caregiver code owner", () => {
		expect(resolveConnectionRoles(patient, caregiver)).toEqual({
			ok: true,
			patient: "me",
		});
	});

	it("pairs a redeeming caregiver with a patient code owner", () => {
		expect(resolveConnectionRoles(caregiver, patient)).toEqual({
			ok: true,
			patient: "target",
		});
	});

	it("rejects two patients", () => {
		expect(resolveConnectionRoles(patient, patient).ok).toBe(false);
	});

	it("rejects two caregivers", () => {
		expect(resolveConnectionRoles(caregiver, caregiver).ok).toBe(false);
	});

	it("rejects when the redeemer has no role", () => {
		expect(resolveConnectionRoles(none, caregiver).ok).toBe(false);
	});

	it("rejects when the code owner has no role", () => {
		expect(resolveConnectionRoles(patient, none).ok).toBe(false);
	});
});
