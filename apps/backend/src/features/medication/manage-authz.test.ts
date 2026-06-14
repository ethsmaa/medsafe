import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { prisma } from "../database/prisma.js";
import { assertCanManagePatient } from "./manage-authz.js";

vi.mock("../database/prisma.js", () => ({
	prisma: {
		patientProfile: { findUnique: vi.fn() },
		caregiverProfile: { findUnique: vi.fn() },
		careTeamMember: { findUnique: vi.fn() },
	},
}));

const asMock = (fn: unknown): Mock => fn as Mock;

beforeEach(() => {
	vi.clearAllMocks();
});

describe("assertCanManagePatient", () => {
	it("allows the patient acting on their own data", async () => {
		asMock(prisma.patientProfile.findUnique).mockResolvedValue({
			userId: "u1",
		});
		await expect(assertCanManagePatient("u1", "p1")).resolves.toBeUndefined();
	});

	it("allows a caregiver with an active relation", async () => {
		asMock(prisma.patientProfile.findUnique).mockResolvedValue({
			userId: "other",
		});
		asMock(prisma.caregiverProfile.findUnique).mockResolvedValue({ id: "cg1" });
		asMock(prisma.careTeamMember.findUnique).mockResolvedValue({
			status: "ACTIVE",
		});
		await expect(assertCanManagePatient("u1", "p1")).resolves.toBeUndefined();
	});

	it("rejects a caregiver whose relation is not active", async () => {
		asMock(prisma.patientProfile.findUnique).mockResolvedValue({
			userId: "other",
		});
		asMock(prisma.caregiverProfile.findUnique).mockResolvedValue({ id: "cg1" });
		asMock(prisma.careTeamMember.findUnique).mockResolvedValue({
			status: "INVITED",
		});
		await expect(assertCanManagePatient("u1", "p1")).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});

	it("rejects a non-caregiver who is not the patient", async () => {
		asMock(prisma.patientProfile.findUnique).mockResolvedValue({
			userId: "other",
		});
		asMock(prisma.caregiverProfile.findUnique).mockResolvedValue(null);
		await expect(assertCanManagePatient("u1", "p1")).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});

	it("rejects when the patient does not exist", async () => {
		asMock(prisma.patientProfile.findUnique).mockResolvedValue(null);
		asMock(prisma.caregiverProfile.findUnique).mockResolvedValue(null);
		await expect(assertCanManagePatient("u1", "p1")).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});
});
