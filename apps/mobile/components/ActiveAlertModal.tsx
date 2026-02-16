import { useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { useAccessibility } from "@/context/AccessibilityContext";

interface ActiveAlertModalProps {
	visible: boolean;
	medicationName: string;
	dosage: string;
	onTake: () => void;
	onSnooze: () => void;
}

export function ActiveAlertModal({
	visible,
	medicationName,
	dosage,
	onTake,
	onSnooze,
}: ActiveAlertModalProps) {
	const { isHighContrast, textSize } = useAccessibility();
	const styles = makeStyles(isHighContrast, textSize);

	// Play Sound Loop
	useEffect(() => {
		let isLooping = true;

		async function startAlert() {
			if (!visible) return;

			// Speech Loop (Simulating Alarm Sound)
			const speakLoop = async () => {
				while (isLooping && visible) {
					Speech.speak(`Time to take ${medicationName}.`, {
						rate: 0.9,
						pitch: 1.0,
					});
					await new Promise((resolve) => setTimeout(resolve, 4000)); // Wait before repeat
				}
			};

			speakLoop();
		}

		if (visible) {
			startAlert();
		} else {
			isLooping = false;
			Speech.stop();
		}

		return () => {
			isLooping = false;
			Speech.stop();
		};
	}, [visible, medicationName]);

	if (!visible) return null;

	return (
		<Modal animationType="slide" transparent={false} visible={visible}>
			<View style={styles.container}>
				<View style={styles.header}>
					<Ionicons
						name="alarm"
						size={80}
						color={isHighContrast ? "black" : "#ef4444"}
					/>
					<Text style={styles.alertTitle}>MEDICATION TIME</Text>
				</View>

				<View style={styles.content}>
					<Text style={styles.medName}>{medicationName}</Text>
					<Text style={styles.medDosage}>{dosage}</Text>
					<Text style={styles.instruction}>
						It is time to take your medication.
					</Text>
				</View>

				<View style={styles.actions}>
					<TouchableOpacity style={styles.takeButton} onPress={onTake}>
						<Ionicons name="checkmark-circle" size={40} color="white" />
						<Text style={styles.takeText}>TAKE NOW</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.snoozeButton} onPress={onSnooze}>
						<Ionicons name="time" size={30} color="black" />
						<Text style={styles.snoozeText}>Snooze 10 Min</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}

const makeStyles = (isHighContrast: boolean, textSize: number) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: isHighContrast ? "white" : "#fee2e2", // Light red background for alarm
			justifyContent: "center",
			alignItems: "center",
			padding: 24,
		},
		header: {
			alignItems: "center",
			marginBottom: 40,
			gap: 16,
		},
		alertTitle: {
			fontSize: 32 * textSize,
			fontWeight: "900",
			color: isHighContrast ? "black" : "#dc2626", // Red text
			letterSpacing: 2,
		},
		content: {
			alignItems: "center",
			marginBottom: 60,
		},
		medName: {
			fontSize: 40 * textSize,
			fontWeight: "bold",
			color: "black",
			textAlign: "center",
			marginBottom: 12,
		},
		medDosage: {
			fontSize: 24 * textSize,
			color: "#4b5563",
			marginBottom: 24,
		},
		instruction: {
			fontSize: 18 * textSize,
			color: "#1f2937",
			textAlign: "center",
		},
		actions: {
			width: "100%",
			gap: 20,
		},
		takeButton: {
			backgroundColor: "#16a34a", // Green
			paddingVertical: 24,
			borderRadius: 24,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: 12,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.3,
			shadowRadius: 5,
			elevation: 6,
		},
		takeText: {
			color: "white",
			fontSize: 28 * textSize,
			fontWeight: "bold",
		},
		snoozeButton: {
			backgroundColor: "#e5e7eb", // Grey
			paddingVertical: 20,
			borderRadius: 24,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: 12,
			borderWidth: 2,
			borderColor: "#9ca3af",
		},
		snoozeText: {
			color: "black",
			fontSize: 20 * textSize,
			fontWeight: "600",
		},
	});
