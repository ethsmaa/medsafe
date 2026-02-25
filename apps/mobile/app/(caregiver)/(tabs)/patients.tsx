import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
	ActivityIndicator,
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useTRPC } from "@/lib/trpc";

export default function PatientsScreen() {
	const router = useRouter();
	const trpc = useTRPC();
	const { isHighContrast, textSize } = useAccessibility();
	const styles = makeStyles(isHighContrast, textSize);

	const patientsQuery = useQuery(trpc.careTeam.getMyPatients.queryOptions());

	const onRefresh = async () => {
		await patientsQuery.refetch();
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>All Patients</Text>
			</View>

			{patientsQuery.isLoading ? (
				<ActivityIndicator
					size="large"
					color={isHighContrast ? "black" : "#d99696"}
				/>
			) : patientsQuery.data?.length === 0 ? (
				<View style={styles.emptyState}>
					<Text style={styles.emptyText}>No active patients yet.</Text>
				</View>
			) : (
				<FlatList
					data={patientsQuery.data}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.listContent}
					refreshControl={
						<RefreshControl
							refreshing={patientsQuery.isLoading}
							onRefresh={onRefresh}
						/>
					}
					renderItem={({ item }) => (
						<View style={styles.patientCard}>
							<View style={styles.patientInfo}>
								<Text style={styles.patientName}>
									{item.patient.user.name || "Unknown"}
								</Text>
								<Text style={styles.patientEmail}>
									{item.patient.user.email}
								</Text>
							</View>
							<TouchableOpacity
								style={styles.viewButton}
								onPress={() =>
									router.push(`/(caregiver)/patient/${item.patient.id}`)
								}
							>
								<Text style={styles.viewButtonText}>View</Text>
							</TouchableOpacity>
						</View>
					)}
				/>
			)}
		</SafeAreaView>
	);
}

const makeStyles = (isHighContrast: boolean, textSize: number) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: isHighContrast ? "#ffffff" : "#f3f4f6",
		},
		header: {
			padding: 16,
			backgroundColor: isHighContrast ? "#ffffff" : "#f3f4f6",
		},
		title: {
			fontSize: 24 * textSize,
			fontWeight: "bold",
			color: isHighContrast ? "#000000" : "#111827",
		},
		listContent: {
			padding: 16,
			gap: 12,
		},
		emptyState: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
		},
		emptyText: {
			fontSize: 16 * textSize,
			color: isHighContrast ? "#000000" : "#6b7280",
		},
		patientCard: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			padding: 16,
			backgroundColor: isHighContrast ? "#ffffff" : "white",
			borderRadius: 12,
			borderWidth: isHighContrast ? 2 : 1,
			borderColor: isHighContrast ? "#000000" : "#e5e7eb",
			marginBottom: 12,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.05,
			shadowRadius: 2,
			elevation: 1,
		},
		patientInfo: {},
		patientName: {
			fontSize: 16 * textSize,
			fontWeight: "600",
			color: isHighContrast ? "#000000" : "#111827",
		},
		patientEmail: {
			fontSize: 14 * textSize,
			color: isHighContrast ? "#000000" : "#6b7280",
		},
		viewButton: {
			paddingVertical: 8,
			paddingHorizontal: 16,
			backgroundColor: isHighContrast ? "#e0e7ff" : "#eff6ff",
			borderRadius: 8,
			borderWidth: isHighContrast ? 1 : 0,
			borderColor: "#000000",
		},
		viewButtonText: {
			color: isHighContrast ? "#000000" : "#d99696",
			fontSize: 14 * textSize,
			fontWeight: "600",
		},
	});
