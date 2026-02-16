import { useAccessibility } from "@/context/AccessibilityContext";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { Colors } from "@/constants/theme";

interface WeekStripProps {
	dates: Date[];
	selectedDate: Date;
	onSelectDate: (date: Date) => void;
}

const isSameDay = (d1: Date, d2: Date) =>
	d1.toISOString().split("T")[0] === d2.toISOString().split("T")[0];

export const WeekStrip = ({
	dates,
	selectedDate,
	onSelectDate,
}: WeekStripProps) => {
	const { isHighContrast, textSize } = useAccessibility();
	const styles = makeStyles(isHighContrast, textSize);

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={styles.stripContainer}
		>
			{dates.map((date, index) => {
				const isSelected = isSameDay(date, selectedDate);
				const isToday = isSameDay(date, new Date());

				return (
					<TouchableOpacity
						key={index}
						style={[styles.dateItem, isSelected && styles.dateItemSelected]}
						onPress={() => onSelectDate(date)}
					>
						<Text style={[styles.dayName, isSelected && styles.textSelected]}>
							{date.toLocaleDateString("en-US", { weekday: "short" })}
						</Text>
						<View
							style={[
								styles.dayNumContainer,
								isSelected && styles.dayNumSelected,
								isToday && !isSelected && styles.dayNumToday,
							]}
						>
							<Text
								style={[
									styles.dayNum,
									isSelected && styles.textSelected,
									isToday && !isSelected && styles.textToday,
								]}
							>
								{date.getDate()}
							</Text>
						</View>
					</TouchableOpacity>
				);
			})}
		</ScrollView>
	);
};

const makeStyles = (isHighContrast: boolean, textSize: number) => {
	const theme = isHighContrast ? Colors.highContrast : Colors.light;
	return StyleSheet.create({
		stripContainer: {
			paddingHorizontal: 16,
			paddingBottom: 16,
			gap: 12,
		},
		dateItem: {
			alignItems: "center",
			justifyContent: "center",
			padding: 8,
			borderRadius: 12,
			minWidth: 50,
		},
		dateItemSelected: {
			backgroundColor: theme.primary,
			shadowColor: theme.primary,
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.3,
			shadowRadius: 8,
		},
		dayName: {
			fontSize: 12 * textSize,
			color: theme.textSecondary,
			marginBottom: 4,
			fontWeight: "600",
		},
		dayNumContainer: {
			width: 36,
			height: 36,
			borderRadius: 18,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: theme.border,
		},
		dayNum: {
			fontSize: 16 * textSize,
			fontWeight: "bold",
			color: theme.text,
		},
		dayNumSelected: {
			backgroundColor: "transparent",
		},
		dayNumToday: {
			borderWidth: 1,
			borderColor: theme.primary,
			backgroundColor: theme.cardBg,
		},
		textSelected: { color: "white" },
		textToday: { color: theme.primary },
	});
};
