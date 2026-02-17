import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors } from "@/constants/theme";
import { useAccessibility } from "@/context/AccessibilityContext";

interface AdherenceCardProps {
	takenCount: number;
	totalCount: number;
	percentage: number;
}

export const AdherenceCard = ({
	takenCount,
	totalCount,
	percentage,
}: AdherenceCardProps) => {
	const { isHighContrast, textSize } = useAccessibility();
	const styles = makeStyles(isHighContrast, textSize);
	const theme = isHighContrast ? Colors.highContrast : Colors.light;

	const radius = 35;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	return (
		<View style={styles.summaryCard}>
			<View>
				<Text style={styles.summaryTitle}>Daily Adherence</Text>
				<Text style={styles.summarySubtitle}>
					{takenCount} of {totalCount} meds taken
				</Text>
			</View>
			<View style={styles.chartContainer}>
				<Svg height="80" width="80" viewBox="0 0 100 100">
					<Circle
						cx="50"
						cy="50"
						r={radius}
						stroke={isHighContrast ? "#ccc" : "#f3f4f6"}
						strokeWidth="10"
						fill="none"
					/>
					<Circle
						cx="50"
						cy="50"
						r={radius}
						stroke={theme.primary}
						strokeWidth="10"
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						strokeLinecap="round"
						fill="none"
						transform="rotate(-90 50 50)"
					/>
					<Text
						style={{
							position: "absolute",
							top: 32,
							left: 24,
							fontSize: 14,
							fontWeight: "bold",
							color: theme.text,
						}}
					>
						{percentage}%
					</Text>
				</Svg>
			</View>
		</View>
	);
};

const makeStyles = (isHighContrast: boolean, textSize: number) => {
	const theme = isHighContrast ? Colors.highContrast : Colors.light;
	return StyleSheet.create({
		summaryCard: {
			backgroundColor: theme.cardBg,
			borderRadius: 24,
			padding: 24,
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: 32,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.05,
			shadowRadius: 10,
			elevation: 2,
			borderWidth: isHighContrast ? 2 : 0,
			borderColor: theme.border,
		},
		summaryTitle: {
			fontSize: 16 * textSize,
			fontWeight: "bold",
			color: theme.text,
			marginBottom: 4,
		},
		summarySubtitle: {
			fontSize: 14 * textSize,
			color: theme.textSecondary,
		},
		chartContainer: {
			position: "relative",
			width: 80,
			height: 80,
			alignItems: "center",
			justifyContent: "center",
		},
	});
};
