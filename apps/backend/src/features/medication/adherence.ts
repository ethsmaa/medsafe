/**
 * Pure adherence calculation shared by the AI assistant's 7-day summary and
 * the patient dashboard. Kept framework-free so it can be unit-tested.
 *
 * Adherence is only meaningful for scheduled frequencies (DAILY, WEEKLY).
 * AS_NEEDED / PERIODIC medications have no fixed expectation, so they
 * contribute neither to the expected total nor to the taken count — counting
 * their intake events in the numerator while excluding them from the
 * denominator is exactly the bug this replaces (a patient with only an
 * as-needed drug would otherwise always read 100%).
 *
 * Expected doses are prorated by how long the prescription has actually been
 * active within the window, so a medication started two days ago is not
 * penalised for the five days before it existed.
 */

const MS_PER_DAY = 86_400_000;

export type AdherencePrescription = {
	frequency: string;
	startDate: Date;
	doseScheduleCount: number;
	events: ReadonlyArray<{ status: string }>;
};

export type AdherenceResult = {
	totalExpected: number;
	taken: number;
	skipped: number;
	missed: number;
	percentage: number;
};

function isScheduled(frequency: string): boolean {
	return frequency === "DAILY" || frequency === "WEEKLY";
}

export function computeAdherence(
	prescriptions: ReadonlyArray<AdherencePrescription>,
	now: Date,
	windowDays = 7,
): AdherenceResult {
	let totalExpected = 0;
	let taken = 0;
	let skipped = 0;
	let missed = 0;

	for (const p of prescriptions) {
		if (!isScheduled(p.frequency)) continue;

		const daysSinceStart = (now.getTime() - p.startDate.getTime()) / MS_PER_DAY;
		const activeDays = Math.min(windowDays, Math.max(0, daysSinceStart));

		if (p.frequency === "DAILY") {
			totalExpected += p.doseScheduleCount * Math.round(activeDays);
		} else {
			// WEEKLY
			totalExpected += p.doseScheduleCount * Math.round(activeDays / 7);
		}

		for (const event of p.events) {
			if (event.status === "TAKEN") taken++;
			else if (event.status === "SKIPPED") skipped++;
			else if (event.status === "MISSED") missed++;
		}
	}

	const percentage =
		totalExpected > 0
			? Math.min(100, Math.round((taken / totalExpected) * 100))
			: 100;

	return { totalExpected, taken, skipped, missed, percentage };
}
