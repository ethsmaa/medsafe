import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabBarLabel } from "@/components/navigation/TabBarLabel";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useTRPC } from "@/lib/trpc";
import { useActivityLogStore } from "@/stores/activityLogStore";

export default function CaregiverTabsLayout() {
	const { isHighContrast } = useAccessibility();
	const insets = useSafeAreaInsets();
	const trpc = useTRPC();

	// Unread badge: fetch all logs and compute how many the caregiver hasn't seen
	const logQuery = useQuery(trpc.careTeam.getActivityLog.queryOptions());
	const allEntries = (logQuery.data ?? []) as Array<{ id: string }>;
	const { getUnreadCount } = useActivityLogStore();
	const unreadCount = getUnreadCount(allEntries);
	const showBadge = unreadCount > 0;

	const tabBarActiveTintColor = "#0F766E";
	const tabBarInactiveTintColor = "#9ca3af";

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor,
				tabBarInactiveTintColor,
				tabBarStyle: {
					backgroundColor: isHighContrast ? "#ffffff" : "#ffffff",
					borderTopWidth: 1,
					borderTopColor: "#e5e7eb",
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
						<Ionicons name="grid" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="patients"
				options={{
					title: "Patients",
					tabBarLabel: ({ color }) => (
						<TabBarLabel labelKey="tab.cabinet" color={color} />
					),
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="people" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="alerts"
				options={{
					title: "Alerts",
					tabBarLabel: ({ color }) => (
						<TabBarLabel labelKey="log.title" color={color} />
					),
					tabBarBadge: showBadge ? unreadCount : undefined,
					tabBarBadgeStyle: showBadge
						? {
								backgroundColor: "#ef4444",
								minWidth: 16,
								height: 16,
								borderRadius: 8,
								fontSize: 10,
								fontWeight: "700",
							}
						: undefined,
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="list" size={size} color={color} />
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
