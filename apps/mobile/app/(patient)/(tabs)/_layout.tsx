import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabBarLabel } from "@/components/navigation/TabBarLabel";
import { useAccessibility } from "@/context/AccessibilityContext";

export default function PatientTabsLayout() {
	const { isHighContrast, isDarkMode } = useAccessibility();
	const insets = useSafeAreaInsets();

	const tabBarActiveTintColor = "#0F766E";
	const tabBarInactiveTintColor = isDarkMode ? "#6b5e5e" : "#9ca3af";

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor,
				tabBarInactiveTintColor,
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
					title: "Home",
					tabBarLabel: ({ color }) => (
						<TabBarLabel labelKey="tab.home" color={color} />
					),
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="meds"
				options={{
					title: "Cabinet",
					tabBarLabel: ({ color }) => (
						<TabBarLabel labelKey="tab.cabinet" color={color} />
					),
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="medkit" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="calendar"
				options={{
					title: "Calendar",
					tabBarLabel: ({ color }) => (
						<TabBarLabel labelKey="tab.calendar" color={color} />
					),
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="calendar" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="assistant"
				options={{
					title: "Assistant",
					tabBarLabel: ({ color }) => (
						<TabBarLabel labelKey="tab.assistant" color={color} />
					),
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="chatbubble-ellipses" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarLabel: ({ color }) => (
						<TabBarLabel labelKey="tab.profile" color={color} />
					),
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="person" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
