import { Ionicons } from "@expo/vector-icons";
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

export default function CabinetScreen() {
	const { isHighContrast, textSize } = useAccessibility();
	const router = useRouter();
	const trpc = useTRPC();
	const styles = makeStyles(isHighContrast, textSize);

	const cabinetQuery = useQuery(trpc.medication.getMyCabinet.queryOptions({}));

	const onRefresh = async () => {
		await cabinetQuery.refetch();
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Medicine Cabinet</Text>
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => router.push("/(patient)/add-medication")}
				>
					<Ionicons
						name="add"
						size={24}
						color={isHighContrast ? "black" : "white"}
					/>
				</TouchableOpacity>
			</View>

			{cabinetQuery.isLoading ? (
				<ActivityIndicator
					size="large"
					color={isHighContrast ? "black" : "#2563eb"}
				/>
			) : cabinetQuery.data?.length === 0 ? (
				<View style={styles.emptyContent}>
					<Text style={styles.emptyText}>Your medications will live here.</Text>
				</View>
			) : (
				<FlatList
					data={cabinetQuery.data}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.listContent}
					refreshControl={
						<RefreshControl
							refreshing={cabinetQuery.isLoading}
							onRefresh={onRefresh}
						/>
					}
					renderItem={({ item }) => (
						<View style={styles.medCard}>
							<View style={styles.medIconPlaceholder}>
								<Text style={styles.medIconText}>💊</Text>
							</View>
							<View style={styles.medInfo}>
								<Text style={styles.medName}>
									{item.medication.nameGeneric}
								</Text>
								<Text style={styles.medDetails}>
									{item.dosageAmount} • {item.frequency}
								</Text>
							</View>
							<View style={styles.stockBadge}>
								<Text style={styles.stockText}>{item.currentStock} left</Text>
							</View>
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
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			padding: 16,
			backgroundColor: isHighContrast ? "#ffffff" : "#f3f4f6",
		},
		title: {
			fontSize: 24 * textSize,
			fontWeight: "bold",
			color: isHighContrast ? "#000000" : "#111827",
		},
		addButton: {
			backgroundColor: isHighContrast ? "#ffcc00" : "#2563eb",
			padding: 8,
			borderRadius: 20,
			borderWidth: isHighContrast ? 2 : 0,
			borderColor: "black",
		},
		listContent: {
			padding: 16,
			gap: 12,
		},
		emptyContent: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
		},
		emptyText: {
			fontSize: 16 * textSize,
			color: isHighContrast ? "#000000" : "#6b7280",
		},
		medCard: {
			flexDirection: "row",
			alignItems: "center",
			padding: 16,
			backgroundColor: isHighContrast ? "#ffffff" : "white",
			borderRadius: 16,
			borderWidth: isHighContrast ? 2 : 1,
			borderColor: isHighContrast ? "#000000" : "#f3f4f6",
			marginBottom: 12,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.05,
			shadowRadius: 2,
			elevation: 1,
		},
		medIconPlaceholder: {
			width: 48,
			height: 48,
			backgroundColor: isHighContrast ? "#e5e7eb" : "#ecfdf5",
			borderRadius: 12,
			alignItems: "center",
			justifyContent: "center",
			marginRight: 16,
			borderWidth: isHighContrast ? 1 : 0,
			borderColor: "black",
		},
		medIconText: {
			fontSize: 24,
		},
		medInfo: {
			flex: 1,
		},
		medName: {
			fontSize: 16 * textSize,
			fontWeight: "bold",
			color: isHighContrast ? "#000000" : "#1f2937",
			marginBottom: 4,
		},
		medDetails: {
			fontSize: 14 * textSize,
			color: isHighContrast ? "#000000" : "#6b7280",
		},
		stockBadge: {
			backgroundColor: isHighContrast ? "#ffffff" : "#f3f4f6",
			paddingHorizontal: 12,
			paddingVertical: 6,
			borderRadius: 12,
			borderWidth: isHighContrast ? 1 : 0,
			borderColor: "black",
		},
		stockText: {
			fontSize: 12 * textSize,
			fontWeight: "600",
			color: isHighContrast ? "#000000" : "#4b5563",
		},
	});
