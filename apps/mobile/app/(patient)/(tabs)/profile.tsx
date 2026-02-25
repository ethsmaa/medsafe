import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useLanguage } from "@/context/LanguageContext";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/react-query";

type ThemeMode = "light" | "dark" | "system";

export default function ProfileScreen() {
	const router = useRouter();
	const {
		isHighContrast,
		isDarkMode,
		themeMode,
		textSize,
		toggleHighContrast,
		setThemeMode,
		setTextSize,
	} = useAccessibility();
	const { locale, setLocale, t } = useLanguage();

	const styles = makeStyles(isHighContrast, isDarkMode, textSize);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await queryClient.cancelQueries();
			queryClient.clear();
			await authClient.signOut();
			router.replace("/login");
		} catch (error) {
			console.error("Logout error:", error);
			router.replace("/login");
		} finally {
			setIsLoggingOut(false);
		}
	};

	const themeOptions: {
		key: ThemeMode;
		label: string;
		icon: keyof typeof Ionicons.glyphMap;
	}[] = [
		{ key: "light", label: t("profile.themeLight"), icon: "sunny-outline" },
		{ key: "dark", label: t("profile.themeDark"), icon: "moon-outline" },
		{
			key: "system",
			label: t("profile.themeSystem"),
			icon: "phone-portrait-outline",
		},
	];

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<Text style={styles.title}>{t("profile.title")}</Text>

				{/* ── Language ── */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Ionicons name="language-outline" size={20} color={"#d99696"} />
						<Text style={styles.sectionTitle}>{t("profile.language")}</Text>
					</View>

					<View style={styles.segmentedControl}>
						<TouchableOpacity
							style={[styles.segment, locale === "tr" && styles.segmentActive]}
							onPress={() => setLocale("tr")}
						>
							<Text
								style={[
									styles.segmentText,
									locale === "tr" && styles.segmentTextActive,
								]}
							>
								TR
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.segment, locale === "en" && styles.segmentActive]}
							onPress={() => setLocale("en")}
						>
							<Text
								style={[
									styles.segmentText,
									locale === "en" && styles.segmentTextActive,
								]}
							>
								EN
							</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* ── Theme ── */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Ionicons
							name="color-palette-outline"
							size={20}
							color={"#d99696"}
						/>
						<Text style={styles.sectionTitle}>{t("profile.theme")}</Text>
					</View>

					<View style={styles.segmentedControl}>
						{themeOptions.map((opt) => (
							<TouchableOpacity
								key={opt.key}
								style={[
									styles.segment,
									themeMode === opt.key && styles.segmentActive,
								]}
								onPress={() => setThemeMode(opt.key)}
							>
								<Ionicons
									name={opt.icon}
									size={16}
									color={
										themeMode === opt.key
											? "#ffffff"
											: isDarkMode
												? "#a09090"
												: "#6b7280"
									}
									style={{ marginRight: 6 }}
								/>
								<Text
									style={[
										styles.segmentText,
										themeMode === opt.key && styles.segmentTextActive,
									]}
								>
									{opt.label}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				{/* ── Accessibility ── */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Ionicons
							name="accessibility-outline"
							size={20}
							color={"#d99696"}
						/>
						<Text style={styles.sectionTitle}>
							{t("profile.accessibility")}
						</Text>
					</View>

					{/* High Contrast */}
					<View style={styles.row}>
						<View style={styles.rowContent}>
							<Ionicons
								name="contrast-outline"
								size={20}
								color={styles.rowIcon.color}
							/>
							<View style={styles.rowText}>
								<Text style={styles.label}>{t("profile.highContrast")}</Text>
								<Text style={styles.description}>
									{t("profile.highContrastDesc")}
								</Text>
							</View>
						</View>
						<Switch
							value={isHighContrast}
							onValueChange={toggleHighContrast}
							trackColor={{
								false: isDarkMode ? "#4a3e3e" : "#d1d5db",
								true: "#d99696",
							}}
							thumbColor="#ffffff"
						/>
					</View>

					{/* Text Size */}
					<View style={styles.row}>
						<View style={styles.rowContent}>
							<Ionicons
								name="text-outline"
								size={20}
								color={styles.rowIcon.color}
							/>
							<View style={styles.rowText}>
								<Text style={styles.label}>{t("profile.textSize")}</Text>
								<Text style={styles.description}>{textSize.toFixed(1)}x</Text>
							</View>
						</View>
					</View>
					<Slider
						style={{ width: "100%", height: 40, marginTop: -8 }}
						minimumValue={0.8}
						maximumValue={2.0}
						step={0.1}
						value={textSize}
						onSlidingComplete={setTextSize}
						minimumTrackTintColor={"#d99696"}
						maximumTrackTintColor={isDarkMode ? "#4a3e3e" : "#d1d5db"}
						thumbTintColor={"#d99696"}
					/>
				</View>

				{/* ── Care Team ── */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Ionicons name="people-outline" size={20} color={"#d99696"} />
						<Text style={styles.sectionTitle}>{t("profile.careTeam")}</Text>
					</View>
					<TouchableOpacity
						style={styles.row}
						onPress={() => router.push("/(patient)/care-team")}
						activeOpacity={0.6}
					>
						<View style={styles.rowContent}>
							<Ionicons
								name="people-circle-outline"
								size={20}
								color={styles.rowIcon.color}
							/>
							<Text style={styles.label}>{t("profile.manageCaregivers")}</Text>
						</View>
						<Ionicons
							name="chevron-forward"
							size={18}
							color={isDarkMode ? "#6b5e5e" : "#9ca3af"}
						/>
					</TouchableOpacity>
				</View>

				{/* ── Account ── */}
				<View style={[styles.section, { marginBottom: 40 }]}>
					<View style={styles.sectionHeader}>
						<Ionicons name="settings-outline" size={20} color={"#d99696"} />
						<Text style={styles.sectionTitle}>{t("profile.account")}</Text>
					</View>
					<TouchableOpacity
						style={styles.row}
						onPress={handleLogout}
						disabled={isLoggingOut}
						activeOpacity={0.6}
					>
						<View style={styles.rowContent}>
							{isLoggingOut ? (
								<ActivityIndicator size="small" color="#ef4444" />
							) : (
								<Ionicons name="log-out-outline" size={20} color="#ef4444" />
							)}
							<Text style={styles.logoutText}>
								{isLoggingOut ? t("profile.loggingOut") : t("profile.logout")}
							</Text>
						</View>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const makeStyles = (
	isHighContrast: boolean,
	isDark: boolean,
	textSize: number,
) => {
	const accent = "#d99696";

	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: isHighContrast
				? "#ffffff"
				: isDark
					? "#1e1414"
					: "#f3f4f6",
		},
		scrollContent: {
			padding: 24,
		},
		title: {
			fontSize: 28 * textSize,
			fontWeight: "700",
			color: isHighContrast ? "#000000" : isDark ? "#f0ecec" : "#111827",
			marginBottom: 28,
			letterSpacing: -0.5,
		},

		// ── Section ──
		section: {
			backgroundColor: isHighContrast
				? "#ffffff"
				: isDark
					? "#2d2424"
					: "#ffffff",
			borderRadius: 14,
			padding: 18,
			marginBottom: 16,
			borderWidth: isHighContrast ? 2 : 0,
			borderColor: isHighContrast ? "#000000" : "transparent",
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: isDark ? 0.15 : 0.04,
			shadowRadius: 3,
			elevation: 1,
		},
		sectionHeader: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
			marginBottom: 14,
		},
		sectionTitle: {
			fontSize: 15 * textSize,
			fontWeight: "600",
			color: isHighContrast ? "#000000" : isDark ? "#a09090" : "#6b7280",
			textTransform: "uppercase",
			letterSpacing: 0.8,
		},

		// ── Segmented Control ──
		segmentedControl: {
			flexDirection: "row",
			backgroundColor: isDark ? "#1e1414" : "#f3f4f6",
			borderRadius: 10,
			padding: 3,
		},
		segment: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			paddingVertical: 10,
			borderRadius: 8,
		},
		segmentActive: {
			backgroundColor: accent,
			shadowColor: accent,
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.3,
			shadowRadius: 4,
			elevation: 2,
		},
		segmentText: {
			fontSize: 14 * textSize,
			fontWeight: "600",
			color: isDark ? "#a09090" : "#6b7280",
		},
		segmentTextActive: {
			color: "#ffffff",
		},

		// ── Rows ──
		row: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingVertical: 10,
		},
		rowContent: {
			flexDirection: "row",
			alignItems: "center",
			gap: 12,
			flex: 1,
		},
		rowText: {
			flex: 1,
		},
		rowIcon: {
			color: isDark ? "#a09090" : "#6b7280",
		},
		label: {
			fontSize: 15 * textSize,
			fontWeight: "500",
			color: isHighContrast ? "#000000" : isDark ? "#f0ecec" : "#374151",
		},
		description: {
			fontSize: 13 * textSize,
			color: isHighContrast ? "#000000" : isDark ? "#6b5e5e" : "#9ca3af",
			marginTop: 2,
		},

		// ── Logout ──
		logoutText: {
			fontSize: 15 * textSize,
			fontWeight: "600",
			color: "#ef4444",
		},
	});
};
