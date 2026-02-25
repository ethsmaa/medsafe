import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useMedicationAction } from "@/hooks/useMedicationAction";
import { useTRPC } from "@/lib/trpc";

export default function CabinetScreen() {
	const { isHighContrast, isDarkMode, textSize } = useAccessibility();
	const router = useRouter();
	const trpc = useTRPC();
	const { deleteMedication } = useMedicationAction();
	const styles = makeStyles(isHighContrast, isDarkMode, textSize);

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
					onPress={() =>
						Alert.alert("İlaç Ekle", "Nasıl eklemek istersiniz?", [
							{
								text: "📝 Manuel Giriş",
								onPress: () => router.push("/(patient)/add-medication"),
							},
							{
								text: "📷 Kutudan Tara (AI)",
								onPress: () => router.push("/(patient)/scan-medication"),
							},
							{ text: "İptal", style: "cancel" },
						])
					}
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
					color={isHighContrast ? "black" : "#d99696"}
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
						<TouchableOpacity
							activeOpacity={0.7}
							onLongPress={() => {
								Alert.alert(
									"Medication Options",
									`Choose an action for ${item.medication.nameBrand || item.medication.nameGeneric}`,
									[
										{ text: "Cancel", style: "cancel" },
										{
											text: "Edit",
											onPress: () => {
												router.push({
													pathname: "/(patient)/add-medication",
													params: { id: item.id },
												});
											},
										},
										{
											text: "Delete",
											style: "destructive",
											onPress: () => deleteMedication(item.id),
										},
									],
								);
							}}
							style={styles.medCard}
						>
							<View style={styles.medIconPlaceholder}>
								<Text style={styles.medIconText}>💊</Text>
							</View>
							<View style={styles.medInfo}>
								<Text style={styles.medName}>
									{item.medication.nameBrand || item.medication.nameGeneric}
								</Text>
								<Text style={styles.medDetails}>
									{item.dosageAmount} • {item.frequency}
								</Text>
							</View>
							<View style={{ alignItems: "flex-end", gap: 8 }}>
								<View style={styles.stockBadge}>
									<Text style={styles.stockText}>{item.currentStock} left</Text>
								</View>
								<TouchableOpacity
									accessibilityLabel={`Options for ${item.medication.nameBrand || item.medication.nameGeneric}`}
									accessibilityHint="Double tap to edit or delete this medication"
									hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
									onPress={() => {
										Alert.alert(
											"Medication Options",
											`Choose an action for ${item.medication.nameBrand || item.medication.nameGeneric}`,
											[
												{ text: "Cancel", style: "cancel" },
												{
													text: "Edit",
													onPress: () => {
														router.push({
															pathname: "/(patient)/add-medication",
															params: { id: item.id },
														});
													},
												},
												{
													text: "Delete",
													style: "destructive",
													onPress: () => deleteMedication(item.id),
												},
											],
										);
									}}
								>
									<Ionicons
										name="ellipsis-horizontal"
										size={24}
										color={
											isHighContrast
												? "black"
												: isDarkMode
													? "#a09090"
													: "#9ca3af"
										}
									/>
								</TouchableOpacity>
							</View>
						</TouchableOpacity>
					)}
				/>
			)}
		</SafeAreaView>
	);
}

const makeStyles = (
	isHighContrast: boolean,
	isDark: boolean,
	textSize: number,
) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: isHighContrast
				? "#ffffff"
				: isDark
					? "#1e1414"
					: "#f3f4f6",
		},
		header: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			padding: 16,
			backgroundColor: isHighContrast
				? "#ffffff"
				: isDark
					? "#1e1414"
					: "#f3f4f6",
		},
		title: {
			fontSize: 24 * textSize,
			fontWeight: "bold",
			color: isHighContrast ? "#000000" : isDark ? "#f0ecec" : "#111827",
		},
		addButton: {
			backgroundColor: isHighContrast
				? "#ffcc00"
				: isDark
					? "#d99696"
					: "#d99696",
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
			color: isHighContrast ? "#000000" : isDark ? "#a09090" : "#6b7280",
		},
		medCard: {
			flexDirection: "row",
			alignItems: "center",
			padding: 16,
			backgroundColor: isHighContrast
				? "#ffffff"
				: isDark
					? "#2d2424"
					: "white",
			borderRadius: 16,
			borderWidth: isHighContrast ? 2 : 1,
			borderColor: isHighContrast ? "#000000" : isDark ? "#4a3e3e" : "#f3f4f6",
			marginBottom: 12,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: isDark ? 0.2 : 0.05,
			shadowRadius: 2,
			elevation: 1,
		},
		medIconPlaceholder: {
			width: 48,
			height: 48,
			backgroundColor: isHighContrast
				? "#e5e7eb"
				: isDark
					? "#3d2a2a"
					: "#f5e0e0",
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
			color: isHighContrast ? "#000000" : isDark ? "#f0ecec" : "#1f2937",
			marginBottom: 4,
		},
		medDetails: {
			fontSize: 14 * textSize,
			color: isHighContrast ? "#000000" : isDark ? "#a09090" : "#6b7280",
		},
		stockBadge: {
			backgroundColor: isHighContrast
				? "#ffffff"
				: isDark
					? "#3d2a2a"
					: "#f3f4f6",
			paddingHorizontal: 12,
			paddingVertical: 6,
			borderRadius: 12,
			borderWidth: isHighContrast ? 1 : 0,
			borderColor: "black",
		},
		stockText: {
			fontSize: 12 * textSize,
			fontWeight: "600",
			color: isHighContrast ? "#000000" : isDark ? "#a09090" : "#4b5563",
		},
	});
