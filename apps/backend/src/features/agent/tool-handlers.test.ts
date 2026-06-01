import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";
import { prisma } from "../database/prisma.js";
import {
	handleGetAdherenceSummary,
	handleGetMedicationDuration,
	handleGetStockStatus,
} from "./tool-handlers.js";

vi.mock("../database/prisma.js", () => ({
	prisma: {
		prescriptionMedication: { findMany: vi.fn(), findFirst: vi.fn() },
	},
}));

const asMock = (fn: unknown): Mock => fn as Mock;

beforeEach(() => {
	vi.clearAllMocks();
});

describe("handleGetStockStatus", () => {
	it("computes days remaining and the low-stock flag per prescription", async () => {
		asMock(prisma.prescriptionMedication.findMany).mockResolvedValue([
			{
				medication: { nameGeneric: "Metformin", nameBrand: null },
				doseSchedules: [{}, {}],
				currentStock: 10,
				restockThreshold: 5,
			},
			{
				medication: { nameGeneric: "Aspirin", nameBrand: "Aspro" },
				doseSchedules: [{}],
				currentStock: 3,
				restockThreshold: 5,
			},
		]);

		const result = await handleGetStockStatus("p1", {});

		expect(result.success).toBe(true);
		expect(result.data).toEqual([
			{
				medicationName: "Metformin",
				currentStock: 10,
				restockThreshold: 5,
				dailyDoses: 2,
				estimatedDaysRemaining: 5,
				isLowStock: false,
			},
			{
				medicationName: "Aspro (Aspirin)",
				currentStock: 3,
				restockThreshold: 5,
				dailyDoses: 1,
				estimatedDaysRemaining: 3,
				isLowStock: true,
			},
		]);
	});
});

describe("handleGetAdherenceSummary", () => {
	it("computes a 7-day adherence percentage for daily medications", async () => {
		asMock(prisma.prescriptionMedication.findMany).mockResolvedValue([
			{
				frequency: "DAILY",
				doseSchedules: [{}, {}],
				intakeEvents: [
					{ status: "TAKEN" },
					{ status: "TAKEN" },
					{ status: "MISSED" },
					{ status: "SKIPPED" },
				],
			},
		]);

		const result = await handleGetAdherenceSummary("p1");

		expect(result.data).toMatchObject({
			periodDays: 7,
			totalExpectedDoses: 14,
			takenDoses: 2,
			missedDoses: 1,
			skippedDoses: 1,
			adherencePercentage: 14,
		});
	});

	it("returns 100% adherence when nothing is expected", async () => {
		asMock(prisma.prescriptionMedication.findMany).mockResolvedValue([]);

		const result = await handleGetAdherenceSummary("p1");

		expect(result.data).toMatchObject({
			totalExpectedDoses: 0,
			adherencePercentage: 100,
		});
	});
});

describe("handleGetMedicationDuration", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-06-02T12:00:00.000Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("computes days since start and days remaining from the end date", async () => {
		asMock(prisma.prescriptionMedication.findFirst).mockResolvedValue({
			medication: { nameGeneric: "Metformin", nameBrand: null },
			startDate: new Date("2026-05-26T00:00:00.000Z"),
			endDate: new Date("2026-06-09T00:00:00.000Z"),
		});

		const result = await handleGetMedicationDuration("p1", {
			medicationName: "Metformin",
		});

		expect(result.data).toMatchObject({
			medicationName: "Metformin",
			daysSinceStart: 7,
			daysRemaining: 7,
		});
	});

	it("reports a not-found error when no active prescription matches", async () => {
		asMock(prisma.prescriptionMedication.findFirst).mockResolvedValue(null);

		const result = await handleGetMedicationDuration("p1", {
			medicationName: "Nope",
		});

		expect(result.success).toBe(false);
	});
});
