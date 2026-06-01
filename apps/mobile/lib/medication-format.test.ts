import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	formatFrequency,
	formatMealStatus,
	minutesUntilNextDose,
} from "./medication-format";

describe("formatFrequency", () => {
	it("maps known frequencies to labels", () => {
		expect(formatFrequency("DAILY")).toBe("Daily");
		expect(formatFrequency("AS_NEEDED")).toBe("As Needed");
	});

	it("passes through unknown values", () => {
		expect(formatFrequency("WHATEVER")).toBe("WHATEVER");
	});
});

describe("formatMealStatus", () => {
	it("maps known meal statuses to labels", () => {
		expect(formatMealStatus("BEFORE_MEAL")).toBe("Before Meal");
		expect(formatMealStatus("ANY")).toBe("Any Time");
	});

	it("passes through unknown values", () => {
		expect(formatMealStatus("X")).toBe("X");
	});
});

describe("minutesUntilNextDose", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-06-02T08:00:00")); // 08:00 local = 480 min
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns minutes until the next upcoming time today", () => {
		expect(
			minutesUntilNextDose([{ timeOfDay: "09:00" }, { timeOfDay: "13:00" }]),
		).toBe(60);
	});

	it("rolls over to tomorrow's first dose when all of today's have passed", () => {
		// 07:00 already passed at 08:00 -> 1440 - 480 + 420
		expect(minutesUntilNextDose([{ timeOfDay: "07:00" }])).toBe(1380);
	});

	it("returns 1 for empty or missing schedules", () => {
		expect(minutesUntilNextDose([])).toBe(1);
		expect(minutesUntilNextDose(undefined)).toBe(1);
	});
});
