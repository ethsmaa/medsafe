import { describe, expect, it } from "vitest";
import { type AdherencePrescription, computeAdherence } from "./adherence.js";

const NOW = new Date("2026-06-14T12:00:00.000Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000);
const taken = (n: number) =>
	Array.from({ length: n }, () => ({ status: "TAKEN" }));

describe("computeAdherence", () => {
	it("returns 100% when nothing is expected", () => {
		expect(computeAdherence([], NOW).percentage).toBe(100);
	});

	it("reports 0% for a weekly med with no doses taken (was wrongly 100%)", () => {
		const meds: AdherencePrescription[] = [
			{
				frequency: "WEEKLY",
				startDate: daysAgo(30),
				doseScheduleCount: 1,
				events: [],
			},
		];
		const r = computeAdherence(meds, NOW);
		expect(r.totalExpected).toBe(1);
		expect(r.percentage).toBe(0);
	});

	it("does not penalize a daily med for days before it started", () => {
		const meds: AdherencePrescription[] = [
			{
				frequency: "DAILY",
				startDate: daysAgo(2),
				doseScheduleCount: 1,
				events: taken(2),
			},
		];
		const r = computeAdherence(meds, NOW);
		expect(r.totalExpected).toBe(2);
		expect(r.percentage).toBe(100);
	});

	it("excludes as-needed meds from expected and taken", () => {
		const meds: AdherencePrescription[] = [
			{
				frequency: "AS_NEEDED",
				startDate: daysAgo(30),
				doseScheduleCount: 1,
				events: taken(5),
			},
		];
		const r = computeAdherence(meds, NOW);
		expect(r.totalExpected).toBe(0);
		expect(r.taken).toBe(0);
		expect(r.percentage).toBe(100);
	});

	it("computes a half-taken daily week as 50%", () => {
		const meds: AdherencePrescription[] = [
			{
				frequency: "DAILY",
				startDate: daysAgo(30),
				doseScheduleCount: 2,
				events: taken(7),
			},
		];
		const r = computeAdherence(meds, NOW);
		expect(r.totalExpected).toBe(14);
		expect(r.percentage).toBe(50);
	});

	it("clamps percentage to 100", () => {
		const meds: AdherencePrescription[] = [
			{
				frequency: "DAILY",
				startDate: daysAgo(30),
				doseScheduleCount: 1,
				events: taken(20),
			},
		];
		expect(computeAdherence(meds, NOW).percentage).toBe(100);
	});
});
