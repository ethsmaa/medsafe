import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAccessibility } from "@/context/AccessibilityContext";

export default function AlertsScreen() {
	const { isHighContrast, textSize } = useAccessibility();
	const styles = makeStyles(isHighContrast, textSize);

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.title}>Alerts</Text>
			<View style={styles.content}>
				<Text style={styles.text}>No active alerts.</Text>
			</View>
		</SafeAreaView>
	);
}

const makeStyles = (isHighContrast: boolean, textSize: number) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: isHighContrast ? "#ffffff" : "#f3f4f6",
			padding: 16,
		},
		title: {
			fontSize: 24 * textSize,
			fontWeight: "bold",
			color: isHighContrast ? "#000000" : "#111827",
			marginBottom: 24,
		},
		content: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
		},
		text: {
			fontSize: 16 * textSize,
			color: isHighContrast ? "#000000" : "#6b7280",
		},
	});
