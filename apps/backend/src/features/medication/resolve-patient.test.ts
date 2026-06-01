import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { prisma } from "../database/prisma.js";
import { resolveTargetPatient } from "./resolve-patient.js";

vi.mock("../database/prisma.js", () => ({
	prisma: {
		caregiverProfile: { findUnique: vi.fn() },
		careTeamMember: { findUnique: vi.fn() },
		patientProfile: { findUnique: vi.fn(), create: vi.fn() },
	},
}));

const asMock = (fn: unknown): Mock => fn as Mock;

beforeEach(() => {
	vi.clearAllMocks();
});

describe("resolveTargetPatient — caregiver flow", () => {
	it("returns the patient id when the caregiver has an active relation", async () => {
		asMock(prisma.caregiverProfile.findUnique).mockResolvedValue({ id: "cg1" });
		asMock(prisma.careTeamMember.findUnique).mockResolvedValue({
			status: "ACTIVE",
		});

		await expect(resolveTargetPatient("u1", "p1")).resolves.toBe("p1");
	});

	it("rejects with FORBIDDEN when the user is not a caregiver", async () => {
		asMock(prisma.caregiverProfile.findUnique).mockResolvedValue(null);

		await expect(resolveTargetPatient("u1", "p1")).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});

	it("rejects with FORBIDDEN when the relation is not active", async () => {
		asMock(prisma.caregiverProfile.findUnique).mockResolvedValue({ id: "cg1" });
		asMock(prisma.careTeamMember.findUnique).mockResolvedValue({
			status: "INVITED",
		});

		await expect(resolveTargetPatient("u1", "p1")).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});
});

describe("resolveTargetPatient — self flow", () => {
	it("returns the user's own patient profile id", async () => {
		asMock(prisma.patientProfile.findUnique).mockResolvedValue({ id: "self1" });

		await expect(resolveTargetPatient("u1")).resolves.toBe("self1");
	});

	it("auto-creates a profile when missing and autoCreate is true", async () => {
		asMock(prisma.patientProfile.findUnique).mockResolvedValue(null);
		asMock(prisma.patientProfile.create).mockResolvedValue({ id: "new1" });

		await expect(
			resolveTargetPatient("u1", undefined, { autoCreate: true }),
		).resolves.toBe("new1");
		expect(prisma.patientProfile.create).toHaveBeenCalledOnce();
	});

	it("rejects with NOT_FOUND when missing and autoCreate is false", async () => {
		asMock(prisma.patientProfile.findUnique).mockResolvedValue(null);

		await expect(resolveTargetPatient("u1")).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
