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
