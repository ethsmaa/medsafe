import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useLanguage } from "@/context/LanguageContext";

export default function PatientTabsLayout() {
	const { isHighContrast, isDarkMode, textSize } = useAccessibility();
	const { t } = useLanguage();
	const insets = useSafeAreaInsets();

	const tabBarActiveTintColor = "#d99696";
	const tabBarInactiveTintColor = isDarkMode ? "#6b5e5e" : "#9ca3af";

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor,
				tabBarInactiveTintColor,
				tabBarLabelStyle: {
					fontSize: 12 * textSize,
					fontWeight: "500",
					marginBottom: 4,
				},
				tabBarStyle: {
					backgroundColor: isHighContrast
						? "#ffffff"
						: isDarkMode
							? "#2d2424"
							: "#ffffff",
					borderTopWidth: 1,
					borderTopColor: isDarkMode ? "#4a3e3e" : "#e5e7eb",
					paddingTop: 8,
					paddingBottom: Math.max(insets.bottom, 8),
					height: 60 + Math.max(insets.bottom, 8),
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: t("tab.home"),
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="meds"
				options={{
					title: t("tab.cabinet"),
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="medkit" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="calendar"
				options={{
					title: t("tab.calendar"),
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="calendar" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="assistant"
				options={{
					title: t("tab.assistant"),
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="chatbubble-ellipses" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: t("tab.profile"),
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="person" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
