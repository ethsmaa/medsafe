import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTRPC } from "@/lib/trpc";

export default function PatientDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const trpc = useTRPC();

	const patientQuery = useQuery(
		trpc.careTeam.getPatientData.queryOptions({ patientId: id! }),
	);

	if (patientQuery.isLoading) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<ActivityIndicator size="large" />
			</SafeAreaView>
		);
	}

	if (patientQuery.error || !patientQuery.data) {
		return (
			<SafeAreaView style={styles.container}>
				<Text style={styles.errorText}>
					Failed to load patient data. Please try again.
				</Text>
			</SafeAreaView>
		);
	}

	const patient = patientQuery.data;

	return (
		<SafeAreaView style={styles.container} edges={["bottom"]}>
			<Stack.Screen
				options={{
					headerShown: true,
					title: patient.user.name || "Patient Details",
					headerBackTitle: "Dashboard",
				}}
			/>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				{/* Header Section */}
				<View style={styles.header}>
					<View style={styles.avatarPlaceholder}>
						<Text style={styles.avatarText}>
							{(patient.user.name?.[0] || "P").toUpperCase()}
						</Text>
					</View>
					<Text style={styles.name}>{patient.user.name}</Text>
					<Text style={styles.email}>{patient.user.email}</Text>
				</View>

				{/* Medications Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Active Medications</Text>
					{patient.prescriptions.length === 0 ? (
						<View style={styles.emptyState}>
							<Text style={styles.emptyText}>No active medications.</Text>
						</View>
					) : (
						<View style={styles.medList}>
							{patient.prescriptions.map((prescription) => (
								<View key={prescription.id} style={styles.medCard}>
									<View style={styles.medHeader}>
										<Text style={styles.medName}>
											{prescription.medication.nameBrand ||
												prescription.medication.nameGeneric}
										</Text>
										<Text style={styles.medDosage}>
											{prescription.dosageAmount}
										</Text>
									</View>
									<Text style={styles.medSchedule}>
										{prescription.frequency} •{" "}
										{new Date(prescription.startDate).toLocaleDateString()}
									</Text>
									{prescription.instructions && (
										<Text style={styles.medInstructions}>
											{prescription.instructions}
										</Text>
									)}
								</View>
							))}
						</View>
					)}
				</View>

				{/* Adherence Section (Placeholder) */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Recent Adherence</Text>
					<View style={styles.emptyState}>
						<Text style={styles.emptyText}>No recent logs available.</Text>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f9fafb",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	scrollContent: {
		padding: 24,
	},
	errorText: {
		color: "#ef4444",
		fontSize: 16,
		textAlign: "center",
		marginTop: 20,
	},
	header: {
		alignItems: "center",
		marginBottom: 32,
	},
	avatarPlaceholder: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "#e0e7ff",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 16,
	},
	avatarText: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#4f46e5",
	},
	name: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#111827",
		marginBottom: 4,
	},
	email: {
		fontSize: 16,
		color: "#6b7280",
	},
	section: {
		backgroundColor: "white",
		borderRadius: 16,
		padding: 20,
		marginBottom: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#1f2937",
		marginBottom: 16,
	},
	emptyState: {
		padding: 20,
		alignItems: "center",
		justifyContent: "center",
		borderStyle: "dashed",
		borderWidth: 1,
		borderColor: "#e5e7eb",
		borderRadius: 12,
	},
	emptyText: {
		color: "#9ca3af",
	},
	medList: {
		gap: 12,
	},
	medCard: {
		padding: 16,
		backgroundColor: "#f9fafb",
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#e5e7eb",
	},
	medHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 4,
	},
	medName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#111827",
	},
	medDosage: {
		fontSize: 14,
		fontWeight: "500",
		color: "#4f46e5",
		backgroundColor: "#e0e7ff",
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 12,
		overflow: "hidden",
	},
	medSchedule: {
		fontSize: 14,
		color: "#4b5563",
		marginBottom: 4,
	},
	medInstructions: {
		fontSize: 14,
		color: "#6b7280",
		fontStyle: "italic",
	},
});
