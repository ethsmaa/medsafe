import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useAccessibility } from "@/context/AccessibilityContext";

export default function PatientTabsLayout() {
	const { isHighContrast, textSize } = useAccessibility();

	// Using consistent colors for the tab bar
	const tabBarActiveTintColor = "#5D9C9B"; // Primary Teal
	const tabBarInactiveTintColor = "#9ca3af"; // Gray-400
	const tabBarStyle = {
		backgroundColor: isHighContrast ? "#ffffff" : "#ffffff",
		borderTopWidth: 1,
		borderTopColor: "#e5e7eb",
		paddingTop: 8,
		height: 88, // Taller tab bar
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
					title: "Home",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="meds"
				options={{
					title: "Cabinet",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="medkit" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="calendar"
				options={{
					title: "Calendar",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="calendar" size={size} color={color} />
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
