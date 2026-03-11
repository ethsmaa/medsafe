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
import { useNotifications } from "@/hooks/useNotifications";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/react-query";

export default function ProfileScreen() {
	const router = useRouter();
	const { isHighContrast, textSize, toggleHighContrast, setTextSize } =
		useAccessibility();

	const styles = makeStyles(isHighContrast, textSize);
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
			console.error("Logout error:", error);
			router.replace("/login");
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<Text style={styles.title}>Profile & Settings</Text>

				{/* Accessibility Settings */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Accessibility</Text>

					{/* High Contrast */}
					<View style={styles.settingRow}>
						<View>
							<Text style={styles.label}>High Contrast Mode</Text>
							<Text style={styles.description}>
								Increase color contrast for better visibility
							</Text>
						</View>
						<Switch
							value={isHighContrast}
							onValueChange={toggleHighContrast}
							trackColor={{ false: "#d1d5db", true: "#d99696" }}
							thumbColor={isHighContrast ? "#ffffff" : "#f4f3f4"}
						/>
					</View>

					{/* Text Size */}
					<View style={styles.settingRow}>
						<View>
							<Text style={styles.label}>Text Size</Text>
							<Text style={styles.description}>
								Adjust text scale ({textSize.toFixed(1)}x)
							</Text>
						</View>
					</View>
					<Slider
						style={{ width: "100%", height: 40 }}
						minimumValue={0.8}
						maximumValue={2.0}
						step={0.1}
						value={textSize}
						onSlidingComplete={setTextSize}
						minimumTrackTintColor="#d99696"
						maximumTrackTintColor="#d1d5db"
					/>
				</View>

				{/* Account Actions */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Account</Text>
					<TouchableOpacity
						style={styles.logoutButton}
						onPress={handleLogout}
						disabled={isLoggingOut}
					>
						{isLoggingOut ? (
							<ActivityIndicator size="small" color="#ef4444" />
						) : (
							<Ionicons name="log-out-outline" size={24} color="#ef4444" />
						)}
						<Text style={styles.logoutText}>
							{isLoggingOut ? "Logging Out..." : "Log Out"}
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const makeStyles = (isHighContrast: boolean, textSize: number) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: isHighContrast ? "#ffffff" : "#f3f4f6",
		},
		scrollContent: {
			padding: 24,
		},
		title: {
			fontSize: 32 * textSize,
			fontWeight: "bold",
			color: isHighContrast ? "#000000" : "#111827",
			marginBottom: 32,
		},
		section: {
			backgroundColor: isHighContrast ? "#ffffff" : "#ffffff",
			borderRadius: 16,
			padding: 20,
			marginBottom: 24,
			borderWidth: isHighContrast ? 2 : 0,
			borderColor: "#000000",
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.05,
			shadowRadius: 2,
			elevation: 1,
		},
		sectionTitle: {
			fontSize: 18 * textSize,
			fontWeight: "bold",
			color: isHighContrast ? "#000000" : "#1f2937",
			marginBottom: 16,
		},
		settingRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: 16,
		},
		label: {
			fontSize: 16 * textSize,
			fontWeight: "600",
			color: isHighContrast ? "#000000" : "#374151",
			marginBottom: 4,
		},
		description: {
			fontSize: 14 * textSize,
			color: isHighContrast ? "#000000" : "#6b7280",
			maxWidth: "90%",
		},
		logoutButton: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
			paddingVertical: 8,
		},
		logoutText: {
			fontSize: 16 * textSize,
			fontWeight: "600",
			color: "#ef4444",
		},
	});
