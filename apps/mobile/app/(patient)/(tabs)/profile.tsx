import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "@/context/LanguageContext";
import { authClient } from "@/lib/auth-client";
import { logger } from "@/lib/logger";
import { queryClient } from "@/lib/react-query";

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

					{/* Text size is driven by the phone's own text-size setting */}
					<View className="flex-row items-start gap-3 py-1">
						<Ionicons name="text-outline" size={20} className={ROW_ICON} />
						<View className="flex-1">
							<Text className="font-medium text-sm text-text-main-light dark:text-text-main-dark">
								{t("profile.textSize")}
							</Text>
							<Text className="mt-0.5 text-text-sub-light text-xs dark:text-text-sub-dark">
								{t("profile.textSizeHint")}
							</Text>
						</View>
					</View>
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
