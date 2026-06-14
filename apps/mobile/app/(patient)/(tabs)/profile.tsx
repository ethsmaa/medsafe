import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useLanguage } from "@/context/LanguageContext";
import { authClient } from "@/lib/auth-client";
import { logger } from "@/lib/logger";
import { queryClient } from "@/lib/react-query";

type ThemeMode = "light" | "dark" | "system";

const SECTION =
	"mb-4 rounded-[14px] bg-surface-light p-[18px] shadow-sm dark:bg-surface-dark";
const SECTION_TITLE =
	"font-semibold text-sm uppercase tracking-wider text-text-sub-light dark:text-text-sub-dark";
const SEGMENT = "flex-1 flex-row items-center justify-center rounded-lg py-2.5";
const SEGMENT_TEXT =
	"font-semibold text-sm text-text-sub-light dark:text-text-sub-dark";
const ROW = "flex-row items-center justify-between py-2.5";
const ROW_ICON = "text-text-sub-light dark:text-text-sub-dark";

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

	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await queryClient.cancelQueries();
			queryClient.clear();
			await authClient.signOut();
			router.replace("/login");
		} catch (error) {
			logger.error("Logout error:", error);
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
		<SafeAreaView
			className="flex-1 bg-background-light dark:bg-background-dark"
			edges={["top"]}
		>
			<ScrollView contentContainerClassName="p-6">
				<Text
					accessibilityRole="header"
					className="mb-7 font-bold text-3xl text-text-main-light tracking-tight dark:text-text-main-dark"
				>
					{t("profile.title")}
				</Text>

				{/* ── Language ── */}
				<View className={SECTION}>
					<View className="mb-3.5 flex-row items-center gap-2">
						<Ionicons
							name="language-outline"
							size={20}
							className="text-primary"
						/>
						<Text className={SECTION_TITLE}>{t("profile.language")}</Text>
					</View>

					<View className="flex-row rounded-[10px] bg-background-light p-[3px] dark:bg-background-dark">
						<TouchableOpacity
							className={`${SEGMENT} ${locale === "tr" ? "bg-primary shadow-sm" : ""}`}
							onPress={() => setLocale("tr")}
							accessibilityRole="button"
							accessibilityState={{ selected: locale === "tr" }}
						>
							<Text
								className={`${SEGMENT_TEXT} ${locale === "tr" ? "text-white" : ""}`}
							>
								TR
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							className={`${SEGMENT} ${locale === "en" ? "bg-primary shadow-sm" : ""}`}
							onPress={() => setLocale("en")}
							accessibilityRole="button"
							accessibilityState={{ selected: locale === "en" }}
						>
							<Text
								className={`${SEGMENT_TEXT} ${locale === "en" ? "text-white" : ""}`}
							>
								EN
							</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* ── Theme ── */}
				<View className={SECTION}>
					<View className="mb-3.5 flex-row items-center gap-2">
						<Ionicons
							name="color-palette-outline"
							size={20}
							className="text-primary"
						/>
						<Text className={SECTION_TITLE}>{t("profile.theme")}</Text>
					</View>

					<View className="flex-row rounded-[10px] bg-background-light p-[3px] dark:bg-background-dark">
						{themeOptions.map((opt) => (
							<TouchableOpacity
								key={opt.key}
								className={`${SEGMENT} ${themeMode === opt.key ? "bg-primary shadow-sm" : ""}`}
								onPress={() => setThemeMode(opt.key)}
								accessibilityRole="button"
								accessibilityState={{ selected: themeMode === opt.key }}
								accessibilityLabel={opt.label}
							>
								<Ionicons
									name={opt.icon}
									size={16}
									className={`mr-1.5 ${themeMode === opt.key ? "text-white" : ROW_ICON}`}
								/>
								<Text
									className={`${SEGMENT_TEXT} ${themeMode === opt.key ? "text-white" : ""}`}
								>
									{opt.label}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				{/* ── Accessibility ── */}
				<View className={SECTION}>
					<View className="mb-3.5 flex-row items-center gap-2">
						<Ionicons
							name="accessibility-outline"
							size={20}
							className="text-primary"
						/>
						<Text className={SECTION_TITLE}>{t("profile.accessibility")}</Text>
					</View>

					{/* High Contrast */}
					<View className={ROW}>
						<View className="flex-1 flex-row items-center gap-3">
							<Ionicons
								name="contrast-outline"
								size={20}
								className={ROW_ICON}
							/>
							<View className="flex-1">
								<Text className="font-medium text-sm text-text-main-light dark:text-text-main-dark">
									{t("profile.highContrast")}
								</Text>
								<Text className="mt-0.5 text-text-sub-light text-xs dark:text-text-sub-dark">
									{t("profile.highContrastDesc")}
								</Text>
							</View>
						</View>
						<Switch
							accessibilityLabel={t("profile.highContrast")}
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
					<View className={ROW}>
						<View className="flex-1 flex-row items-center gap-3">
							<Ionicons name="text-outline" size={20} className={ROW_ICON} />
							<View className="flex-1">
								<Text className="font-medium text-sm text-text-main-light dark:text-text-main-dark">
									{t("profile.textSize")}
								</Text>
								<Text className="mt-0.5 text-text-sub-light text-xs dark:text-text-sub-dark">
									{textSize.toFixed(1)}x
								</Text>
							</View>
						</View>
					</View>
					<Slider
						accessibilityLabel={t("profile.textSize")}
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
				<View className={SECTION}>
					<View className="mb-3.5 flex-row items-center gap-2">
						<Ionicons
							name="people-outline"
							size={20}
							className="text-primary"
						/>
						<Text className={SECTION_TITLE}>{t("profile.careTeam")}</Text>
					</View>
					<TouchableOpacity
						className={ROW}
						onPress={() => router.push("/(patient)/care-team")}
						accessibilityRole="button"
						accessibilityLabel={t("profile.manageCaregivers")}
						activeOpacity={0.6}
					>
						<View className="flex-1 flex-row items-center gap-3">
							<Ionicons
								name="people-circle-outline"
								size={20}
								className={ROW_ICON}
							/>
							<Text className="font-medium text-sm text-text-main-light dark:text-text-main-dark">
								{t("profile.manageCaregivers")}
							</Text>
						</View>
						<Ionicons
							name="chevron-forward"
							size={18}
							className="text-text-sub-light dark:text-text-sub-dark"
						/>
					</TouchableOpacity>
				</View>

				{/* ── Account ── */}
				<View className={`${SECTION} mb-10`}>
					<View className="mb-3.5 flex-row items-center gap-2">
						<Ionicons
							name="settings-outline"
							size={20}
							className="text-primary"
						/>
						<Text className={SECTION_TITLE}>{t("profile.account")}</Text>
					</View>
					<TouchableOpacity
						className={ROW}
						onPress={handleLogout}
						disabled={isLoggingOut}
						accessibilityRole="button"
						accessibilityLabel={t("profile.logout")}
						accessibilityState={{ disabled: isLoggingOut, busy: isLoggingOut }}
						activeOpacity={0.6}
					>
						<View className="flex-1 flex-row items-center gap-3">
							{isLoggingOut ? (
								<ActivityIndicator size="small" color="#ef4444" />
							) : (
								<Ionicons
									name="log-out-outline"
									size={20}
									className="text-error-light dark:text-error-dark"
								/>
							)}
							<Text className="font-semibold text-error-light text-sm dark:text-error-dark">
								{isLoggingOut ? t("profile.loggingOut") : t("profile.logout")}
							</Text>
						</View>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
