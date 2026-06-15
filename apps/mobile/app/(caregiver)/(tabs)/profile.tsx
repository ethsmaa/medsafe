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
import { useNotifications } from "@/hooks/useNotifications";
import { authClient } from "@/lib/auth-client";
import { logger } from "@/lib/logger";
import { queryClient } from "@/lib/react-query";

export default function ProfileScreen() {
	const router = useRouter();

	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const { clearNotificationState } = useNotifications();

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			// Sway-like Synchronized Logout
			await clearNotificationState();

			await authClient.signOut();

			await queryClient.invalidateQueries({ queryKey: ["user"] });
			await queryClient.invalidateQueries({ queryKey: ["care-team"] });

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
				<Text className="mb-8 font-bold text-3xl text-text-main-light dark:text-text-main-dark">
					Profile & Settings
				</Text>

				{/* Accessibility Settings */}
				<View className="mb-6 rounded-2xl bg-surface-light p-5 shadow-sm dark:bg-surface-dark">
					<Text className="mb-4 font-bold text-lg text-text-main-light dark:text-text-main-dark">
						Accessibility
					</Text>

					{/* Text size is driven by the phone's own text-size setting */}
					<View className="flex-row items-start gap-3">
						<Ionicons
							name="text-outline"
							size={22}
							className="text-text-sub-light dark:text-text-sub-dark"
						/>
						<View className="flex-1">
							<Text className="mb-1 font-semibold text-base text-text-main-light dark:text-text-main-dark">
								Text Size
							</Text>
							<Text className="text-sm text-text-sub-light dark:text-text-sub-dark">
								Adjust text size in your phone's display settings — the app
								follows it automatically.
							</Text>
						</View>
					</View>
				</View>

				{/* Account Actions */}
				<View className="mb-6 rounded-2xl bg-surface-light p-5 shadow-sm dark:bg-surface-dark">
					<Text className="mb-4 font-bold text-lg text-text-main-light dark:text-text-main-dark">
						Account
					</Text>
					<TouchableOpacity
						className="flex-row items-center gap-2 py-2"
						onPress={handleLogout}
						disabled={isLoggingOut}
					>
						{isLoggingOut ? (
							<ActivityIndicator size="small" color="#ef4444" />
						) : (
							<Ionicons
								name="log-out-outline"
								size={24}
								className="text-error-light dark:text-error-dark"
							/>
						)}
						<Text className="font-semibold text-base text-error-light dark:text-error-dark">
							{isLoggingOut ? "Logging Out..." : "Log Out"}
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
