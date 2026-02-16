import { useAccessibility } from "@/context/AccessibilityContext";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

interface ScheduleItem {
	id: string;
	genericName: string;
	dosage: string;
	timeOfDay: string;
	taken: boolean;
}

interface ScheduleListProps {
	schedule: ScheduleItem[];
	nextDoseId?: string;
}

export const ScheduleList = ({ schedule, nextDoseId }: ScheduleListProps) => {
	const { isHighContrast, textSize } = useAccessibility();
	const styles = makeStyles(isHighContrast, textSize);
	const theme = isHighContrast ? Colors.highContrast : Colors.light;

	if (schedule.length === 0) {
		return (
			<Text
				style={{
					color: theme.textSecondary,
					fontStyle: "italic",
					marginLeft: 24,
				}}
			>
				No medications scheduled.
			</Text>
		);
	}

	return (
		<View style={styles.timeline}>
			{schedule.map((item, index) => {
				const isNext = item.id === nextDoseId;
				const isLast = index === schedule.length - 1;

				return (
					<View key={index} style={styles.timelineItem}>
						{/* Status Icon */}
						<View
							style={[
								styles.timelineIconContainer,
								item.taken ? styles.iconTaken : styles.iconPending,
							]}
						>
							<Ionicons
								name={item.taken ? "checkmark" : isNext ? "time" : "hourglass"}
								size={18}
								color={
									item.taken ? "white" : isNext ? "white" : "#9ca3af" // Gray for pending
								}
							/>
						</View>

						{/* Line Connector */}
						{!isLast && <View style={styles.timelineLine} />}

						{/* Content */}
						<View
							style={[
								styles.timelineContent,
								isNext && styles.activeTimelineContent,
							]}
						>
							<View style={{ flex: 1 }}>
								<Text
									style={[
										styles.tlMedName,
										item.taken && styles.textStrikethrough,
									]}
								>
									{item.genericName}
								</Text>
								<Text style={styles.tlDosage}>{item.dosage}</Text>
							</View>
							<Text
								style={[
									styles.tlTime,
									isNext && {
										color: theme.primary,
										fontWeight: "bold",
									},
								]}
							>
								{item.timeOfDay}
							</Text>
						</View>
					</View>
				);
			})}
		</View>
	);
};

const makeStyles = (isHighContrast: boolean, textSize: number) => {
	const theme = isHighContrast ? Colors.highContrast : Colors.light;
	return StyleSheet.create({
		timeline: {
			paddingLeft: 24, // Space for line
		},
		timelineItem: {
			flexDirection: "row",
			marginBottom: 24,
			position: "relative",
		},
		timelineLine: {
			position: "absolute",
			left: 9, // Center of icon (18/2) is 9
			top: 24, // Start below icon
			bottom: -24, // Extend to next
			width: 2,
			backgroundColor: "#e5e7eb",
			zIndex: -1,
		},
		timelineIconContainer: {
			width: 24, // Larger than icon
			height: 24,
			borderRadius: 12,
			alignItems: "center",
			justifyContent: "center",
			marginRight: 16,
			borderWidth: 2,
			borderColor: theme.cardBg,
			zIndex: 1,
			backgroundColor: theme.cardBg, // default
		},
		iconTaken: {
			backgroundColor: theme.success, // Green
		},
		iconPending: {
			backgroundColor: "#e5e7eb", // Gray
		},
		timelineContent: {
			flex: 1,
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			backgroundColor: theme.cardBg,
			padding: 16,
			borderRadius: 16,
			borderWidth: 1,
			borderColor: theme.border,
		},
		activeTimelineContent: {
			borderColor: theme.primary,
			borderLeftWidth: 4,
		},
		tlMedName: {
			fontSize: 16 * textSize,
			fontWeight: "bold",
			color: theme.text,
		},
		textStrikethrough: {
			textDecorationLine: "line-through",
			color: theme.textSecondary,
		},
		tlDosage: {
			fontSize: 13 * textSize,
			color: theme.textSecondary,
		},
		tlTime: {
			fontSize: 14 * textSize,
			color: theme.textSecondary,
			fontWeight: "500",
		},
	});
};
