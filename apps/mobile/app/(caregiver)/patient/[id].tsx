import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "@/context/LanguageContext";
import { useTRPC } from "@/lib/trpc";

export default function PatientDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const trpc = useTRPC();
	const { t } = useLanguage();

	const patientQuery = useQuery(
		trpc.careTeam.getPatientData.queryOptions({ patientId: id! }),
	);

	if (patientQuery.isLoading) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#d99696" />
			</SafeAreaView>
		);
	}

	if (patientQuery.error || !patientQuery.data) {
		return (
			<SafeAreaView style={styles.container}>
				<Text style={styles.errorText}>{t("validation.error")}</Text>
			</SafeAreaView>
		);
	}

	const patient = patientQuery.data;

	// Flatten all intake events for the "Recent Activity" section
	const allLogs = patient.prescriptions
		.flatMap((p) =>
			p.intakeEvents.map((e) => ({
				...e,
				medicationName: p.medication.nameBrand || p.medication.nameGeneric,
			})),
		)
		.sort(
			(a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime(),
		)
		.slice(0, 10);

	return (
		<SafeAreaView style={styles.container} edges={["bottom"]}>
			<Stack.Screen
				options={{
					headerShown: true,
					title: patient.user.name || t("cg.patientDetails"),
					headerBackTitle: t("cg.dashboard"),
				}}
			/>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				{/* Patient Info Card */}
				<View style={styles.headerCard}>
					<View style={styles.avatarCircle}>
						<Text style={styles.avatarText}>
							{(patient.user.name?.[0] || "P").toUpperCase()}
						</Text>
					</View>
					<View style={styles.headerInfo}>
						<Text style={styles.name}>{patient.user.name}</Text>
						<Text style={styles.email}>{patient.user.email}</Text>
					</View>
					<TouchableOpacity
						style={styles.addMedFab}
						onPress={() =>
							router.push(`/(caregiver)/add-medication?patientId=${id}`)
						}
					>
						<Ionicons name="add" size={24} color="white" />
					</TouchableOpacity>
				</View>

				{/* Medications Section */}
				<View style={styles.sectionHeader}>
					<Ionicons name="medical" size={20} color="#d99696" />
					<Text style={styles.sectionTitle}>{t("cg.medications")}</Text>
				</View>

				{patient.prescriptions.length === 0 ? (
					<View style={styles.emptyCard}>
						<Text style={styles.emptyText}>{t("cg.noMedications")}</Text>
					</View>
				) : (
					<View style={styles.medGrid}>
						{patient.prescriptions.map((p) => (
							<View key={p.id} style={styles.medCard}>
								<View style={styles.medIconBox}>
									<Ionicons name="medkit" size={24} color="#d99696" />
								</View>
								<View style={styles.medContent}>
									<Text style={styles.medName} numberOfLines={1}>
										{p.medication.nameBrand || p.medication.nameGeneric}
									</Text>
									<Text style={styles.medSub}>
										{p.dosageAmount} • {p.frequency}
									</Text>
								</View>
								<TouchableOpacity
									onPress={() =>
										router.push({
											pathname: "/(caregiver)/add-medication",
											params: { id: p.id, patientId: id },
										})
									}
									style={styles.medEditBtn}
								>
									<Ionicons name="chevron-forward" size={20} color="#9ca3af" />
								</TouchableOpacity>
							</View>
						))}
					</View>
				)}

				{/* Recent Activity Log */}
				<View style={styles.sectionHeader}>
					<Ionicons name="list" size={20} color="#d99696" />
					<Text style={styles.sectionTitle}>{t("log.title")}</Text>
				</View>

				{allLogs.length === 0 ? (
					<View style={styles.emptyCard}>
						<Text style={styles.emptyText}>{t("log.empty")}</Text>
					</View>
				) : (
					<View style={styles.logList}>
						{allLogs.map((log) => (
							<View key={log.id} style={styles.logItem}>
								<View
									style={[
										styles.logStatusDot,
										{
											backgroundColor:
												log.status === "TAKEN"
													? "#22c55e"
													: log.status === "SKIPPED"
														? "#eab308"
														: "#ef4444",
										},
									]}
								/>
								<View style={styles.logContent}>
									<Text style={styles.logTitle}>{log.medicationName}</Text>
									<Text style={styles.logTime}>
										{new Date(log.takenAt).toLocaleString()}
									</Text>
								</View>
								<Text
									style={[
										styles.logStatusText,
										{
											color:
												log.status === "TAKEN"
													? "#16a34a"
													: log.status === "SKIPPED"
														? "#ca8a04"
														: "#dc2626",
										},
									]}
								>
									{t(
										log.status === "TAKEN"
											? "log.statusTaken"
											: log.status === "SKIPPED"
												? "log.statusSkipped"
												: "log.statusMissed",
									)}
								</Text>
							</View>
						))}
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f3f4f6", // Muted light gray background
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	scrollContent: {
		padding: 16,
		paddingBottom: 40,
	},
	errorText: {
		color: "#ef4444",
		fontSize: 16,
		textAlign: "center",
		marginTop: 20,
	},
	headerCard: {
		backgroundColor: "white",
		borderRadius: 24,
		padding: 20,
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.05,
		shadowRadius: 10,
		elevation: 2,
	},
	avatarCircle: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: "#f5e0e0",
		justifyContent: "center",
		alignItems: "center",
	},
	avatarText: {
		fontSize: 24,
		fontWeight: "800",
		color: "#d99696",
	},
	headerInfo: {
		flex: 1,
		marginLeft: 16,
	},
	name: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#111827",
	},
	email: {
		fontSize: 14,
		color: "#6b7280",
	},
	addMedFab: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: "#d99696",
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#d99696",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 4,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
		marginLeft: 4,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "800",
		color: "#1f2937",
		marginLeft: 8,
		letterSpacing: -0.5,
	},
	emptyCard: {
		backgroundColor: "white",
		borderRadius: 16,
		padding: 24,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "#e5e7eb",
		borderStyle: "dashed",
		marginBottom: 24,
	},
	emptyText: {
		color: "#9ca3af",
	},
	medGrid: {
		marginBottom: 24,
		gap: 12,
	},
	medCard: {
		backgroundColor: "white",
		borderRadius: 16,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.03,
		shadowRadius: 5,
		elevation: 1,
	},
	medIconBox: {
		width: 48,
		height: 48,
		borderRadius: 12,
		backgroundColor: "#fde8e8",
		justifyContent: "center",
		alignItems: "center",
	},
	medContent: {
		flex: 1,
		marginLeft: 12,
	},
	medName: {
		fontSize: 16,
		fontWeight: "700",
		color: "#111827",
	},
	medSub: {
		fontSize: 13,
		color: "#6b7280",
		marginTop: 2,
	},
	medEditBtn: {
		padding: 4,
	},
	logList: {
		backgroundColor: "white",
		borderRadius: 20,
		padding: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.03,
		shadowRadius: 5,
		elevation: 1,
	},
	logItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#f3f4f6",
	},
	logStatusDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: 12,
	},
	logContent: {
		flex: 1,
	},
	logTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: "#111827",
	},
	logTime: {
		fontSize: 12,
		color: "#9ca3af",
		marginTop: 2,
	},
	logStatusText: {
		fontSize: 13,
		fontWeight: "700",
	},
});
