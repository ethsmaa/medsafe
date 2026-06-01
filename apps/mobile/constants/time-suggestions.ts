/**
 * Smart time suggestions based on dose count and meal status.
 * Inspired by Medisafe's approach of morning/afternoon/evening slots.
 */

import type { MealStatus } from "./medication";

interface TimeSuggestion {
	hour: number;
	minute: number;
}

/**
 * Time templates: offset from meal times
 * BEFORE_MEAL: 30 min before typical meal times
 * AFTER_MEAL: 30 min after typical meal times
 * WITH_FOOD: at meal times
 * ANY: evenly spaced through waking hours
 */

const SUGGESTIONS: Record<string, TimeSuggestion[]> = {
	BEFORE_MEAL: [
		{ hour: 7, minute: 30 }, // 30 min before breakfast
		{ hour: 12, minute: 30 }, // 30 min before lunch
		{ hour: 19, minute: 30 }, // 30 min before dinner
		{ hour: 16, minute: 0 }, // afternoon (for 4x)
	],
	AFTER_MEAL: [
		{ hour: 8, minute: 30 }, // 30 min after breakfast
		{ hour: 13, minute: 30 }, // 30 min after lunch
		{ hour: 20, minute: 30 }, // 30 min after dinner
		{ hour: 16, minute: 30 }, // afternoon (for 4x)
	],
	WITH_FOOD: [
		{ hour: 8, minute: 0 }, // breakfast
		{ hour: 13, minute: 0 }, // lunch
		{ hour: 20, minute: 0 }, // dinner
		{ hour: 16, minute: 0 }, // snack time (for 4x)
	],
	ANY: [
		{ hour: 9, minute: 0 }, // morning
		{ hour: 14, minute: 0 }, // afternoon
		{ hour: 21, minute: 0 }, // evening
		{ hour: 17, minute: 0 }, // late afternoon (for 4x)
	],
};

/**
 * Generate smart time suggestions based on dose count and meal status.
 * Returns an array of Date objects with suggested reminder times.
 */
export function suggestTimes(
	doseCount: number,
	mealStatus: MealStatus,
): Date[] {
	const pool = SUGGESTIONS[mealStatus] ?? SUGGESTIONS.ANY;
	const count = Math.min(doseCount, pool.length);

	return pool.slice(0, count).map((t) => {
		const d = new Date();
		d.setHours(t.hour, t.minute, 0, 0);
		return d;
	});
}

/**
 * Dose count options for the stepper UI.
 */
export const DOSE_COUNT_OPTIONS = [1, 2, 3, 4] as const;
