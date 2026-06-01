// Pure formatting / scheduling helpers — no React Native imports, so unit-testable.

export function formatFrequency(f: string): string {
	switch (f) {
		case "DAILY":
			return "Daily";
		case "WEEKLY":
			return "Weekly";
		case "AS_NEEDED":
			return "As Needed";
		case "PERIODIC":
			return "Periodic";
		default:
			return f;
	}
}

export function formatMealStatus(m: string): string {
	switch (m) {
		case "BEFORE_MEAL":
			return "Before Meal";
		case "AFTER_MEAL":
			return "After Meal";
		case "WITH_FOOD":
			return "With Food";
		case "ANY":
			return "Any Time";
		default:
			return m;
	}
}

/**
 * Minutes from now until the nearest upcoming "HH:MM" dose time.
 * If all of today's times have passed, returns minutes until tomorrow's first.
 */
export function minutesUntilNextDose(
	schedules: { timeOfDay: string }[] | undefined,
): number {
	if (!schedules || schedules.length === 0) return 1;
	const now = new Date();
	const nowMin = now.getHours() * 60 + now.getMinutes();
	const todayMinutes = schedules
		.map((s) => {
			const [h, m] = s.timeOfDay.split(":").map(Number);
			return (h || 0) * 60 + (m || 0);
		})
		.sort((a, b) => a - b);
	const upcoming = todayMinutes.find((m) => m > nowMin);
	if (upcoming !== undefined) return upcoming - nowMin;
	// Today is done — first dose tomorrow.
	return 24 * 60 - nowMin + (todayMinutes[0] ?? 0);
}
