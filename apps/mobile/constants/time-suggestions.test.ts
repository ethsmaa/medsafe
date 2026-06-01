import { describe, expect, it } from "vitest";
import { DOSE_COUNT_OPTIONS, suggestTimes } from "./time-suggestions";

const hm = (d: Date) => `${d.getHours()}:${d.getMinutes()}`;

describe("suggestTimes", () => {
	it("returns the requested number of slots for WITH_FOOD", () => {
		expect(suggestTimes(2, "WITH_FOOD").map(hm)).toEqual(["8:0", "13:0"]);
	});

	it("returns the four daily slots in template order for ANY", () => {
		expect(suggestTimes(4, "ANY").map(hm)).toEqual([
			"9:0",
			"14:0",
			"21:0",
			"17:0",
		]);
	});

	it("clamps the count to the pool size (max 4)", () => {
		expect(suggestTimes(10, "BEFORE_MEAL")).toHaveLength(4);
	});

	it("returns an empty array for a zero count", () => {
		expect(suggestTimes(0, "AFTER_MEAL")).toEqual([]);
	});

	it("falls back to the ANY pool for an unknown meal status", () => {
		expect(suggestTimes(1, "SOMETHING" as never).map(hm)).toEqual(["9:0"]);
	});

	it("exposes the stepper dose-count options", () => {
		expect(DOSE_COUNT_OPTIONS).toEqual([1, 2, 3, 4]);
	});
});
