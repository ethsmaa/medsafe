import { Ionicons } from "@expo/vector-icons";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { Colors } from "@/constants/theme";
import { useAccessibility } from "@/context/AccessibilityContext";

interface NextDose {
	id: string;
	genericName: string;
	dosage: string;
	form: string;
	timeOfDay: string;
	mealStatus: string;
	prescriptionMedicationId: string;
}

interface NextDoseCardProps {
	nextDose: NextDose | null; // Use specific type ideally
	onTakeNow: (med: NextDose) => void;
	isTaking: boolean;
}

export const NextDoseCard = ({
	nextDose,
	onTakeNow,
	isTaking,
}: NextDoseCardProps) => {
	const { isHighContrast, textSize } = useAccessibility();
	const styles = makeStyles(isHighContrast, textSize);
	const theme = isHighContrast ? Colors.highContrast : Colors.light;

	if (!nextDose) {
		return (
			<View style={styles.emptyState}>
				<Ionicons
					name="checkmark-done-circle"
					size={48}
					color={theme.success}
				/>
				<Text style={styles.emptyStateText}>All caught up for today!</Text>
			</View>
		);
	}

	return (
		<View style={styles.nextDoseCard}>
			<View style={styles.nextDoseHeader}>
				<View style={styles.medIconBg}>
					<Ionicons name="medkit" size={28} color={theme.primary} />
				</View>
				<View style={{ flex: 1 }}>
					<Text style={styles.ndMedName}>{nextDose.genericName}</Text>
					<Text style={styles.ndDosage}>
						{nextDose.dosage} • {nextDose.form}
					</Text>
				</View>
				<View style={styles.timeBadge}>
					<Text style={styles.timeBadgeText}>{nextDose.timeOfDay}</Text>
				</View>
			</View>

			<View style={styles.instructionRow}>
				<Ionicons name="restaurant" size={18} color={theme.textSecondary} />
				<Text style={styles.instructionText}>
					{nextDose.mealStatus === "BEFORE_MEAL"
						? "Take before meal"
						: nextDose.mealStatus === "AFTER_MEAL"
							? "Take after meal"
							: nextDose.mealStatus === "WITH_FOOD"
								? "Take with food"
								: "Any time"}
				</Text>
			</View>

			<TouchableOpacity
				style={styles.takeNowButton}
				onPress={() => onTakeNow(nextDose)}
				disabled={isTaking}
			>
				{isTaking ? (
					<ActivityIndicator color="white" />
				) : (
					<>
						<Ionicons name="checkmark-circle" size={20} color="white" />
						<Text style={styles.takeNowText}>Take Now</Text>
					</>
				)}
			</TouchableOpacity>
		</View>
	);
};

const makeStyles = (isHighContrast: boolean, textSize: number) => {
	const theme = isHighContrast ? Colors.highContrast : Colors.light;
	return StyleSheet.create({
		nextDoseCard: {
			backgroundColor: theme.cardBg,
			borderRadius: 24,
			padding: 20,
			shadowColor: theme.primary,
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.1,
			shadowRadius: 12,
			elevation: 4,
			marginBottom: 12,
			borderWidth: 1,
			borderColor: isHighContrast ? "black" : "#ecfeff",
		},
		nextDoseHeader: {
			flexDirection: "row",
			gap: 16,
			marginBottom: 16,
		},
		medIconBg: {
			width: 56,
			height: 56,
			borderRadius: 18,
			backgroundColor: isHighContrast ? "#eee" : "#ecfeff",
			alignItems: "center",
			justifyContent: "center",
		},
		ndMedName: {
			fontSize: 22 * textSize,
			fontWeight: "bold",
			color: theme.text,
			marginBottom: 4,
		},
		ndDosage: {
			fontSize: 16 * textSize,
			color: theme.textSecondary,
		},
		timeBadge: {
			backgroundColor: isHighContrast ? "#eee" : "#fff7ed",
			paddingHorizontal: 12,
			paddingVertical: 6,
			borderRadius: 12,
			height: 32,
			justifyContent: "center",
		},
		timeBadgeText: {
			color: isHighContrast ? "black" : "#ea580c",
			fontWeight: "bold",
			fontSize: 14 * textSize,
		},
		instructionRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
			marginBottom: 20,
			backgroundColor: isHighContrast ? "#eee" : "#f9fafb",
			padding: 12,
			borderRadius: 12,
		},
		instructionText: {
			color: theme.text,
			fontSize: 15 * textSize,
		},
		takeNowButton: {
			backgroundColor: isHighContrast ? "black" : "#d99696",
			borderRadius: 16,
			paddingVertical: 16,
			flexDirection: "row",
			justifyContent: "center",
			alignItems: "center",
			gap: 8,
			shadowColor: theme.primary,
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.3,
			shadowRadius: 8,
		},
		takeNowText: {
			color: "white",
			fontSize: 18 * textSize,
			fontWeight: "bold",
		},
		emptyState: {
			padding: 24,
			alignItems: "center",
			backgroundColor: theme.cardBg,
			borderRadius: 16,
			gap: 12,
			borderWidth: isHighContrast ? 2 : 1,
			borderColor: theme.border,
		},
		emptyStateText: {
			fontSize: 16 * textSize,
			color: theme.textSecondary,
			fontWeight: "500",
		},
	});
};
