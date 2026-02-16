import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useAccessibility } from "@/context/AccessibilityContext";

export default function CaregiverTabsLayout() {
	const { isHighContrast, textSize } = useAccessibility();

	// Using consistent colors for the tab bar
	const tabBarActiveTintColor = "#5D9C9B"; // Primary Teal
	const tabBarInactiveTintColor = "#9ca3af"; // Gray-400
	const tabBarStyle = {
		backgroundColor: isHighContrast ? "#ffffff" : "#ffffff", // Keep white for clean look
		borderTopWidth: 1,
		borderTopColor: "#e5e7eb",
		paddingTop: 8,
		height: 88, // Taller tab bar for modern look
	};

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
				tabBarStyle,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Dashboard",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="grid" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="patients"
				options={{
					title: "Patients",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="people" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="alerts"
				options={{
					title: "Alerts",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="notifications" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="person" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
