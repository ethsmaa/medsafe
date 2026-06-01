/**
 * Unified color palette — single source of truth.
 * Primary: warm rose (#d99696)
 * All screens should import from here instead of hardcoding colors.
 */
export const Colors = {
	light: {
		background: "#f8f6f6",
		text: "#161313",
		textSecondary: "#6b5e5e",
		primary: "#d99696",
		primaryLight: "#f5e0e0",
		cardBg: "#ffffff",
		border: "#e3dede",
		success: "#10b981",
		error: "#ef4444",
		warning: "#f59e0b",
		info: "#3b82f6",
		icon: "#6b5e5e",
		tint: "#d99696",
	},
	highContrast: {
		background: "#ffffff",
		text: "#000000",
		textSecondary: "#000000",
		primary: "#000000",
		primaryLight: "#e5e7eb",
		cardBg: "#ffffff",
		border: "#000000",
		success: "#000000",
		error: "#000000",
		warning: "#000000",
		info: "#000000",
		icon: "#000000",
		tint: "#000000",
	},
	dark: {
		background: "#1e1414",
		text: "#f0ecec",
		textSecondary: "#a09090",
		primary: "#d99696",
		primaryLight: "#3d2a2a",
		cardBg: "#2d2424",
		border: "#4a3e3e",
		success: "#34d399",
		error: "#f87171",
		warning: "#fbbf24",
		info: "#60a5fa",
		icon: "#a09090",
		tint: "#d99696",
	},
};

/**
 * Assistant-feature-specific palette (chat bubbles, mic, listening UI).
 * Kept separate from semantic Colors because these are stylistic accents
 * not shared with other screens.
 */
export const AssistantColors = {
	accent: "#f87171",
	accentWarm: "#fb923c",
	accentSoft: {
		light: "#e8a0a0",
		dark: "#d99696",
	},
	iconMuted: {
		light: "#9ca3af",
		dark: "#a38383",
	},
	micIdleIcon: {
		light: "#6b7280",
		dark: "#d99696",
	},
	inputPlaceholder: {
		light: "#9ca3af",
		dark: "#6b5e5e",
	},
	screenBg: {
		light: "#ffffff",
		dark: "#1a1212",
	},
	ringHigh: "rgba(248,113,113,0.25)",
	ringLow: "rgba(248,113,113,0.18)",
	centerBg: {
		light: "rgba(244,114,114,0.12)",
		dark: "rgba(244,114,114,0.18)",
	},
	waveColors: ["#f87171", "#fb923c", "#f87171", "#fb923c", "#f87171"],
};

export const Layout = {
	padding: 20,
	borderRadius: 16,
};

export const Fonts = {
	regular: "Inter-Regular",
	medium: "Inter-Medium",
	bold: "Inter-Bold",
	rounded: "Inter-Regular",
	mono: "SpaceMono-Regular",
};
