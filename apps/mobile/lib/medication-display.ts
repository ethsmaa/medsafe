import type { Ionicons } from "@expo/vector-icons";

export type IconName = keyof typeof Ionicons.glyphMap;

export const MEAL_ICONS: Record<string, IconName> = {
	BEFORE_MEAL: "restaurant-outline",
	AFTER_MEAL: "restaurant",
	WITH_FOOD: "fast-food-outline",
	ANY: "time-outline",
};

export const FORM_ICONS: Record<string, IconName> = {
	TABLET: "medkit-outline",
	CAPSULE: "medkit",
	SYRUP: "beaker-outline",
	CREAM: "brush-outline",
	INJECTION: "flask-outline",
	OTHER: "ellipsis-horizontal-circle-outline",
};
