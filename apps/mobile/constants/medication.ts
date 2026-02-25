/**
 * Shared medication constants used across forms, backend schemas, and scan logic.
 * Single source of truth for all medication-related enums.
 */

export const MEDICATION_FORMS = [
	"TABLET",
	"CAPSULE",
	"SYRUP",
	"CREAM",
	"INJECTION",
	"OTHER",
] as const;

export const MEDICATION_FREQUENCIES = [
	"DAILY",
	"WEEKLY",
	"AS_NEEDED",
	"PERIODIC",
] as const;

export const MEAL_STATUSES = [
	"BEFORE_MEAL",
	"AFTER_MEAL",
	"WITH_FOOD",
	"ANY",
] as const;

export type MedicationForm = (typeof MEDICATION_FORMS)[number];
export type MedicationFrequency = (typeof MEDICATION_FREQUENCIES)[number];
export type MealStatus = (typeof MEAL_STATUSES)[number];
