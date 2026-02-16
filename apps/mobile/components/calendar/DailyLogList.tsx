import { useAccessibility } from "@/context/AccessibilityContext";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

interface LogItem {
	id: string;
	type: string;
	time: string;
	medName: string;
	dosage: string;
	status: string;
	medId: string;
}

interface DailyLogListProps {
	isLoading: boolean;
	logs: LogItem[];
}

export const DailyLogList = ({ isLoading, logs }: DailyLogListProps) => {
	const { isHighContrast, textSize } = useAccessibility();
	const styles = makeStyles(isHighContrast, textSize);
	const theme = isHighContrast ? Colors.highContrast : Colors.light;

	if (isLoading) {
		return (
			<ActivityIndicator
				size="large"
				color={theme.primary}
				style={{ marginTop: 40 }}
			/>
		);
	}

	if (logs.length === 0) {
		return (
			<View style={styles.emptyState}>
				<Ionicons
					name="calendar-outline"
					size={48}
					color={theme.textSecondary}
				/>
				<Text style={styles.emptyText}>No records for this day.</Text>
			</View>
		);
	}

	return (
		<View style={styles.timeline}>
			{logs.map((item) => (
				<View key={item.id} style={styles.card}>
					<View
						style={[
							styles.statusIndicator,
							item.status === "TAKEN"
								? styles.statusTaken
								: item.status === "MISSED"
									? styles.statusMissed
									: styles.statusUpcoming,
						]}
					/>

					<View style={styles.cardContent}>
						<View style={styles.cardRow}>
							<Text style={styles.timeText}>{item.time}</Text>
							<View
								style={[
									styles.badge,
									item.status === "TAKEN"
										? styles.badgeTaken
										: item.status === "MISSED"
											? styles.badgeMissed
											: styles.badgeUpcoming,
								]}
							>
								<Text
									style={[
										styles.badgeText,
										item.status === "TAKEN"
											? styles.badgeTextTaken
											: item.status === "MISSED"
												? styles.badgeTextMissed
												: styles.badgeTextUpcoming,
									]}
								>
									{item.status}
								</Text>
							</View>
						</View>
						<View>
							<Text style={styles.medName}>{item.medName}</Text>
							<Text style={styles.dosage}>{item.dosage}</Text>
						</View>
					</View>

					<View style={styles.iconContainer}>
						<Ionicons
							name={
								item.status === "TAKEN"
									? "checkmark-circle"
									: item.status === "MISSED"
										? "alert-circle"
										: "time"
							}
							size={28}
							color={
								item.status === "TAKEN"
									? theme.success
									: item.status === "MISSED"
										? theme.error
										: "#cbd5e1"
							}
						/>
					</View>
				</View>
			))}
		</View>
	);
};

const makeStyles = (isHighContrast: boolean, textSize: number) => {
	const theme = isHighContrast ? Colors.highContrast : Colors.light;
	return StyleSheet.create({
		timeline: {
			gap: 16,
		},
		card: {
			backgroundColor: theme.cardBg,
			borderRadius: 16,
			flexDirection: "row",
			overflow: "hidden",
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.05,
			shadowRadius: 4,
			elevation: 2,
			borderWidth: 1,
			borderColor: theme.border,
		},
		statusIndicator: {
			width: 6,
			height: "100%",
		},
		statusTaken: { backgroundColor: theme.success },
		statusMissed: { backgroundColor: theme.error },
		statusUpcoming: { backgroundColor: "#cbd5e1" },

		cardContent: {
			flex: 1,
			padding: 16,
			gap: 8,
		},
		cardRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
		},
		timeText: {
			fontSize: 16 * textSize,
			fontWeight: "bold",
			color: theme.text,
		},
		medName: {
			fontSize: 16 * textSize,
			fontWeight: "600",
			color: theme.textSecondary, // Slightly lighter
		},
		dosage: {
			fontSize: 14 * textSize,
			color: theme.textSecondary,
		},
		iconContainer: {
			padding: 16,
			justifyContent: "center",
			alignItems: "center",
		},
		// Badges
		badge: {
			paddingHorizontal: 8,
			paddingVertical: 2,
			borderRadius: 8,
		},
		badgeTaken: { backgroundColor: "#d1fae5" },
		badgeMissed: { backgroundColor: "#fee2e2" },
		badgeUpcoming: { backgroundColor: "#f1f5f9" },

		badgeText: { fontSize: 10 * textSize, fontWeight: "bold" },
		badgeTextTaken: { color: "#047857" },
		badgeTextMissed: { color: "#b91c1c" },
		badgeTextUpcoming: { color: "#64748b" },

		emptyState: {
			alignItems: "center",
			justifyContent: "center",
			marginTop: 40,
			opacity: 0.5,
		},
		emptyText: {
			marginTop: 12,
			fontSize: 16 * textSize,
			color: theme.textSecondary,
		},
	});
};
