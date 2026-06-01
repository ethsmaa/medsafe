import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useMedicationAction } from "@/hooks/useMedicationAction";
import { fireDeviceAlarm, stopDeviceAlarm } from "@/lib/deviceApi";
import { useTRPC } from "@/lib/trpc";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MEAL_ICONS: Record<string, string> = {
	BEFORE_MEAL: "restaurant-outline",
	AFTER_MEAL: "restaurant",
	WITH_FOOD: "fast-food-outline",
	ANY: "time-outline",
};

const FORM_ICONS: Record<string, string> = {
	TABLET: "medkit-outline",
	CAPSULE: "medkit",
	SYRUP: "beaker-outline",
	CREAM: "brush-outline",
	INJECTION: "flask-outline",
	OTHER: "ellipsis-horizontal-circle-outline",
};

function formatFrequency(f: string): string {
	switch (f) {
		case "DAILY":
			return "Daily";
		case "WEEKLY":
			return "Weekly";
		case "AS_NEEDED":
			return "As Needed";
		case "PERIODIC":
			return "Periodic";
		default:
			return f;
	}
}

function formatMealStatus(m: string): string {
	switch (m) {
		case "BEFORE_MEAL":
			return "Before Meal";
		case "AFTER_MEAL":
			return "After Meal";
		case "WITH_FOOD":
			return "With Food";
		case "ANY":
			return "Any Time";
		default:
			return m;
	}
}

// Schedule'daki "HH:MM" zamanlardan, simdiden sonraki en yakininin kac dakika
// sonra oldugunu doner. Bugunun tum zamanlari gectiyse yarinin ilk zamanini kullanir.
function minutesUntilNextDose(
	schedules: { timeOfDay: string }[] | undefined,
): number {
	if (!schedules || schedules.length === 0) return 1;
	const now = new Date();
	const nowMin = now.getHours() * 60 + now.getMinutes();
	const todayMinutes = schedules
		.map((s) => {
			const [h, m] = s.timeOfDay.split(":").map(Number);
			return (h || 0) * 60 + (m || 0);
		})
		.sort((a, b) => a - b);
	const upcoming = todayMinutes.find((m) => m > nowMin);
	if (upcoming !== undefined) return upcoming - nowMin;
	// Bugun bitti, yarinin ilki
	return 24 * 60 - nowMin + todayMinutes[0];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MedicationDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const { isHighContrast, isDarkMode, textSize } = useAccessibility();
	const trpc = useTRPC();
	const { deleteMedication } = useMedicationAction();
	const styles = makeStyles(isHighContrast, isDarkMode, textSize);

	// Use getMyCabinet and find the specific medication by id
	const cabinetQuery = useQuery(trpc.medication.getMyCabinet.queryOptions({}));
	const med = cabinetQuery.data?.find((m) => m.id === id);

	if (cabinetQuery.isLoading) {
		return (
			<SafeAreaView style={styles.container} edges={["top"]}>
				<View style={styles.centered}>
					<ActivityIndicator size="large" color="#d99696" />
				</View>
			</SafeAreaView>
		);
	}

	if (!med) {
		return (
			<SafeAreaView style={styles.container} edges={["top"]}>
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.backBtn}
					>
						<Ionicons
							name="arrow-back"
							size={24}
							color={isHighContrast ? "#000" : "#374151"}
						/>
					</TouchableOpacity>
				</View>
				<View style={styles.centered}>
					<Text style={styles.errorText}>Medication not found.</Text>
				</View>
			</SafeAreaView>
		);
	}

	const name = med.medication.nameBrand || med.medication.nameGeneric;
	const formIconName = FORM_ICONS[med.form] ?? "medkit-outline";
	const isLowStock = med.currentStock <= med.restockThreshold;

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
					<Ionicons
						name="arrow-back"
						size={24}
						color={isHighContrast ? "#000" : "#374151"}
					/>
				</TouchableOpacity>
				<Text style={styles.headerTitle} numberOfLines={1}>
					{name}
				</Text>
				<TouchableOpacity
					style={styles.editBtn}
					onPress={() =>
						router.push({
							pathname: "/(patient)/add-medication",
							params: { id: med.id },
						})
					}
				>
					<Ionicons
						name="create-outline"
						size={22}
						color={isHighContrast ? "#000" : "#d99696"}
					/>
				</TouchableOpacity>
			</View>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Hero */}
				<View style={styles.heroCard}>
					<View style={styles.heroIcon}>
						<Ionicons name={formIconName as any} size={32} color="#d99696" />
					</View>
					<Text style={styles.heroName}>{name}</Text>
					{med.medication.nameBrand && (
						<Text style={styles.heroGeneric}>{med.medication.nameGeneric}</Text>
					)}
					<View style={styles.dosageBadge}>
						<Text style={styles.dosageText}>{med.dosageAmount}</Text>
					</View>
				</View>

				{/* Quick stats row */}
				<View style={styles.statsRow}>
					<View style={styles.statCard}>
						<Ionicons
							name="calendar-outline"
							size={20}
							color={isHighContrast ? "#000" : "#d99696"}
							style={styles.statIcon}
						/>
						<Text style={styles.statLabel}>Frequency</Text>
						<Text style={styles.statValue}>
							{formatFrequency(med.frequency)}
						</Text>
					</View>
					<View style={styles.statCard}>
						<Ionicons
							name={(MEAL_ICONS[med.mealStatus] as any) ?? "time-outline"}
							size={20}
							color={isHighContrast ? "#000" : "#d99696"}
							style={styles.statIcon}
						/>
						<Text style={styles.statLabel}>Timing</Text>
						<Text style={styles.statValue}>
							{formatMealStatus(med.mealStatus)}
						</Text>
					</View>
					<View style={[styles.statCard, isLowStock && styles.statCardWarning]}>
						<Ionicons
							name="cube-outline"
							size={20}
							color={
								isLowStock ? "#dc2626" : isHighContrast ? "#000" : "#d99696"
							}
							style={styles.statIcon}
						/>
						<Text style={styles.statLabel}>Stock</Text>
						<Text
							style={[styles.statValue, isLowStock && styles.statValueWarning]}
						>
							{med.currentStock}
						</Text>
					</View>
				</View>

				{/* Schedule */}
				{med.doseSchedules && med.doseSchedules.length > 0 && (
					<View style={styles.section}>
						<View style={styles.sectionHeaderInner}>
							<Ionicons
								name="notifications-outline"
								size={18}
								color="#d99696"
							/>
							<Text style={styles.sectionTitle}>Reminder Times</Text>
						</View>
						<View style={styles.timesList}>
							{med.doseSchedules.map((s) => (
								<View key={s.id} style={styles.timeChip}>
									<Text style={styles.timeChipText}>{s.timeOfDay}</Text>
								</View>
							))}
						</View>
					</View>
				)}

				{/* Notes / Instructions */}
				{med.instructions ? (
					<View style={styles.section}>
						<View style={styles.sectionHeaderInner}>
							<Ionicons
								name="document-text-outline"
								size={18}
								color="#d99696"
							/>
							<Text style={styles.sectionTitle}>Notes</Text>
						</View>
						<Text style={styles.notesText}>{med.instructions}</Text>
					</View>
				) : null}

				{/* Inventory */}
				<View style={styles.section}>
					<View style={styles.sectionHeaderInner}>
						<Ionicons name="cube-outline" size={18} color="#d99696" />
						<Text style={styles.sectionTitle}>Inventory</Text>
					</View>
					<View style={styles.inventoryRow}>
						<View style={styles.inventoryItem}>
							<Text style={styles.inventoryLabel}>Current Stock</Text>
							<Text
								style={[
									styles.inventoryValue,
									isLowStock && styles.statValueWarning,
								]}
							>
								{med.currentStock} units
							</Text>
						</View>
						<View style={styles.inventoryItem}>
							<Text style={styles.inventoryLabel}>Alert Limit</Text>
							<Text style={styles.inventoryValue}>
								{med.restockThreshold} units
							</Text>
						</View>
					</View>
					{isLowStock && (
						<View style={styles.lowStockWarning}>
							<Ionicons name="alert-circle" size={16} color="#dc2626" />
							<Text style={styles.lowStockText}>
								Stock is running low — consider restocking soon.
							</Text>
						</View>
					)}
				</View>

				{/* ESP32 cihaz kontrolleri */}
				<View style={styles.deviceRow}>
					<TouchableOpacity
						style={[styles.deviceButton, styles.deviceButtonTest]}
						onPress={async () => {
							try {
								const nextDoseMinutes = minutesUntilNextDose(med.doseSchedules);
								await fireDeviceAlarm({
									medication: name,
									nextDoseMinutes,
								});
								const h = Math.floor(nextDoseMinutes / 60);
								const m = nextDoseMinutes % 60;
								const eta = h > 0 ? `${h}s ${m}d` : `${m}d`;
								Alert.alert("Cihaz", `Alarm gönderildi — sonraki doz: ${eta}`);
							} catch (err) {
								Alert.alert(
									"Cihaz hatası",
									(err as Error).message || "Bilinmeyen hata",
								);
							}
						}}
					>
						<Ionicons name="notifications" size={18} color="#0e7490" />
						<Text style={styles.deviceButtonTextTest}>Test Et</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.deviceButton, styles.deviceButtonStop]}
						onPress={async () => {
							try {
								await stopDeviceAlarm();
								Alert.alert("Cihaz", "Alarm durduruldu");
							} catch (err) {
								Alert.alert(
									"Cihaz hatası",
									(err as Error).message || "Bilinmeyen hata",
								);
							}
						}}
					>
						<Ionicons name="stop-circle" size={18} color="#b45309" />
						<Text style={styles.deviceButtonTextStop}>Durdur</Text>
					</TouchableOpacity>
				</View>

				{/* Delete */}
				<TouchableOpacity
					style={styles.deleteButton}
					onPress={() =>
						Alert.alert(
							"Delete Medication",
							`Are you sure you want to delete ${name}?`,
							[
								{ text: "Cancel", style: "cancel" },
								{
									text: "Delete",
									style: "destructive",
									onPress: () => {
										deleteMedication(med.id);
										router.back();
									},
								},
							],
						)
					}
				>
					<Ionicons name="trash-outline" size={18} color="#dc2626" />
					<Text style={styles.deleteText}>Delete Medication</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (
	isHighContrast: boolean,
	isDark: boolean,
	textSize: number,
) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: isHighContrast ? "#fff" : isDark ? "#1e1414" : "#f3f4f6",
		},
		centered: { flex: 1, alignItems: "center", justifyContent: "center" },
		errorText: { fontSize: 16 * textSize, color: "#ef4444" },
		header: {
			flexDirection: "row",
			alignItems: "center",
			paddingHorizontal: 16,
			paddingVertical: 12,
			backgroundColor: isHighContrast ? "#fff" : isDark ? "#1e1414" : "#f3f4f6",
			gap: 12,
		},
		backBtn: { padding: 4 },
		headerTitle: {
			flex: 1,
			fontSize: 18 * textSize,
			fontWeight: "700",
			color: isHighContrast ? "#000" : isDark ? "#f0ecec" : "#111827",
		},
		editBtn: {
			padding: 4,
			width: 36,
			height: 36,
			alignItems: "center",
			justifyContent: "center",
			borderRadius: 18,
			backgroundColor: isHighContrast
				? "#e5e7eb"
				: isDark
					? "#3d2a2a"
					: "#fde8e8",
		},
		scrollContent: { padding: 16, paddingBottom: 40 },
		heroCard: {
			backgroundColor: isHighContrast ? "#fff" : isDark ? "#2d2424" : "white",
			borderRadius: 20,
			padding: 24,
			alignItems: "center",
			marginBottom: 16,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: isDark ? 0.2 : 0.06,
			shadowRadius: 8,
			elevation: 2,
		},
		heroIcon: {
			width: 72,
			height: 72,
			borderRadius: 36,
			backgroundColor: isHighContrast
				? "#f3f4f6"
				: isDark
					? "#3d2a2a"
					: "#fde8e8",
			alignItems: "center",
			justifyContent: "center",
			marginBottom: 12,
		},
		heroIconText: { fontSize: 32 },
		heroName: {
			fontSize: 22 * textSize,
			fontWeight: "800",
			color: isHighContrast ? "#000" : isDark ? "#f0ecec" : "#111827",
			textAlign: "center",
			marginBottom: 4,
		},
		heroGeneric: {
			fontSize: 14 * textSize,
			color: isHighContrast ? "#000" : isDark ? "#a09090" : "#6b7280",
			marginBottom: 12,
		},
		dosageBadge: {
			backgroundColor: isHighContrast ? "#e5e7eb" : "#f5e0e0",
			paddingHorizontal: 16,
			paddingVertical: 6,
			borderRadius: 16,
		},
		dosageText: {
			fontSize: 15 * textSize,
			fontWeight: "700",
			color: "#d99696",
		},
		statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
		statCard: {
			flex: 1,
			backgroundColor: isHighContrast ? "#fff" : isDark ? "#2d2424" : "white",
			borderRadius: 16,
			padding: 14,
			alignItems: "center",
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.04,
			shadowRadius: 4,
			elevation: 1,
		},
		statCardWarning: {
			backgroundColor: "#fef2f2",
			borderWidth: 1,
			borderColor: "#fecaca",
		},
		statIcon: { marginBottom: 6 },
		statLabel: {
			fontSize: 10 * textSize,
			color: isHighContrast ? "#000" : "#9ca3af",
			fontWeight: "600",
			marginBottom: 4,
			textTransform: "uppercase",
		},
		statValue: {
			fontSize: 14 * textSize,
			fontWeight: "700",
			color: isHighContrast ? "#000" : isDark ? "#f0ecec" : "#111827",
		},
		statValueWarning: { color: "#dc2626" },
		section: {
			backgroundColor: isHighContrast ? "#fff" : isDark ? "#2d2424" : "white",
			borderRadius: 16,
			padding: 16,
			marginBottom: 12,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.04,
			shadowRadius: 4,
			elevation: 1,
		},
		sectionTitle: {
			fontSize: 14 * textSize,
			fontWeight: "700",
			color: isHighContrast ? "#000" : isDark ? "#f0ecec" : "#374151",
		},
		sectionHeaderInner: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
			marginBottom: 12,
		},
		timesList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
		timeChip: {
			backgroundColor: isHighContrast ? "#e5e7eb" : "#f5e0e0",
			paddingHorizontal: 14,
			paddingVertical: 8,
			borderRadius: 12,
		},
		timeChipText: {
			fontSize: 15 * textSize,
			fontWeight: "700",
			color: "#d99696",
		},
		notesText: {
			fontSize: 14 * textSize,
			lineHeight: 22,
			color: isHighContrast ? "#000" : isDark ? "#d0c8c8" : "#374151",
		},
		inventoryRow: { flexDirection: "row", gap: 12 },
		inventoryItem: { flex: 1 },
		inventoryLabel: {
			fontSize: 12 * textSize,
			color: isHighContrast ? "#000" : "#9ca3af",
			marginBottom: 4,
		},
		inventoryValue: {
			fontSize: 16 * textSize,
			fontWeight: "700",
			color: isHighContrast ? "#000" : isDark ? "#f0ecec" : "#111827",
		},
		lowStockWarning: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
			marginTop: 12,
			backgroundColor: "#fef2f2",
			padding: 10,
			borderRadius: 10,
		},
		lowStockText: { fontSize: 13 * textSize, color: "#dc2626", flex: 1 },
		deleteButton: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: 8,
			padding: 16,
			borderRadius: 16,
			backgroundColor: isHighContrast ? "#fff" : isDark ? "#2d2424" : "white",
			borderWidth: 1,
			borderColor: "#fecaca",
			marginTop: 4,
		},
		deleteText: {
			fontSize: 15 * textSize,
			fontWeight: "600",
			color: "#dc2626",
		},
		deviceRow: {
			flexDirection: "row",
			gap: 10,
			marginTop: 8,
		},
		deviceButton: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: 8,
			padding: 14,
			borderRadius: 16,
			borderWidth: 1,
		},
		deviceButtonTest: {
			backgroundColor: isHighContrast ? "#fff" : isDark ? "#1c2e33" : "#ecfeff",
			borderColor: "#a5f3fc",
		},
		deviceButtonStop: {
			backgroundColor: isHighContrast ? "#fff" : isDark ? "#3d2e1a" : "#fef3c7",
			borderColor: "#fcd34d",
		},
		deviceButtonTextTest: {
			fontSize: 15 * textSize,
			fontWeight: "600",
			color: "#0e7490",
		},
		deviceButtonTextStop: {
			fontSize: 15 * textSize,
			fontWeight: "600",
			color: "#b45309",
		},
	});
