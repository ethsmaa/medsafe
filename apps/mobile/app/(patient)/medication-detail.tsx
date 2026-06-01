import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MedicationDetailHero } from "@/components/medication/MedicationDetailHero";
import { MedicationDeviceControls } from "@/components/medication/MedicationDeviceControls";
import { MedicationStatsRow } from "@/components/medication/MedicationStatsRow";
import { useMedicationAction } from "@/hooks/useMedicationAction";
import { FORM_ICONS } from "@/lib/medication-display";
import { useTRPC } from "@/lib/trpc";

const SECTION =
	"mb-3 rounded-2xl bg-surface-light p-4 shadow-sm dark:bg-surface-dark";
const SECTION_TITLE =
	"font-bold text-sm text-text-main-light dark:text-text-main-dark";

export default function MedicationDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const trpc = useTRPC();
	const { deleteMedication } = useMedicationAction();

	const cabinetQuery = useQuery(trpc.medication.getMyCabinet.queryOptions({}));
	const med = cabinetQuery.data?.find((m) => m.id === id);

	if (cabinetQuery.isLoading) {
		return (
			<SafeAreaView
				className="flex-1 bg-background-light dark:bg-background-dark"
				edges={["top"]}
			>
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#d99696" />
				</View>
			</SafeAreaView>
		);
	}

	if (!med) {
		return (
			<SafeAreaView
				className="flex-1 bg-background-light dark:bg-background-dark"
				edges={["top"]}
			>
				<View className="flex-row items-center gap-3 px-4 py-3">
					<TouchableOpacity onPress={() => router.back()} className="p-1">
						<Ionicons
							name="arrow-back"
							size={24}
							className="text-text-main-light dark:text-text-main-dark"
						/>
					</TouchableOpacity>
				</View>
				<View className="flex-1 items-center justify-center">
					<Text className="text-base text-error-light dark:text-error-dark">
						Medication not found.
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	const name = med.medication.nameBrand || med.medication.nameGeneric;
	const generic = med.medication.nameBrand ? med.medication.nameGeneric : null;
	const formIconName = FORM_ICONS[med.form] ?? "medkit-outline";
	const isLowStock = med.currentStock <= med.restockThreshold;

	const confirmDelete = () => {
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
		);
	};

	return (
		<SafeAreaView
			className="flex-1 bg-background-light dark:bg-background-dark"
			edges={["top"]}
		>
			{/* Header */}
			<View className="flex-row items-center gap-3 px-4 py-3">
				<TouchableOpacity onPress={() => router.back()} className="p-1">
					<Ionicons
						name="arrow-back"
						size={24}
						className="text-text-main-light dark:text-text-main-dark"
					/>
				</TouchableOpacity>
				<Text
					className="flex-1 font-bold text-lg text-text-main-light dark:text-text-main-dark"
					numberOfLines={1}
				>
					{name}
				</Text>
				<TouchableOpacity
					className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft-light dark:bg-primary-soft-dark"
					onPress={() =>
						router.push({
							pathname: "/(patient)/add-medication",
							params: { id: med.id },
						})
					}
				>
					<Ionicons name="create-outline" size={22} className="text-primary" />
				</TouchableOpacity>
			</View>

			<ScrollView
				contentContainerClassName="p-4 pb-10"
				showsVerticalScrollIndicator={false}
			>
				<MedicationDetailHero
					iconName={formIconName}
					name={name}
					generic={generic}
					dosage={med.dosageAmount}
				/>

				<MedicationStatsRow
					frequency={med.frequency}
					mealStatus={med.mealStatus}
					stock={med.currentStock}
					isLowStock={isLowStock}
				/>

				{/* Schedule */}
				{med.doseSchedules && med.doseSchedules.length > 0 && (
					<View className={SECTION}>
						<View className="mb-3 flex-row items-center gap-2">
							<Ionicons
								name="notifications-outline"
								size={18}
								className="text-primary"
							/>
							<Text className={SECTION_TITLE}>Reminder Times</Text>
						</View>
						<View className="flex-row flex-wrap gap-2">
							{med.doseSchedules.map((s) => (
								<View
									key={s.id}
									className="rounded-xl bg-primary-soft-light px-3.5 py-2 dark:bg-primary-soft-dark"
								>
									<Text className="font-bold text-primary text-sm">
										{s.timeOfDay}
									</Text>
								</View>
							))}
						</View>
					</View>
				)}

				{/* Notes */}
				{med.instructions ? (
					<View className={SECTION}>
						<View className="mb-3 flex-row items-center gap-2">
							<Ionicons
								name="document-text-outline"
								size={18}
								className="text-primary"
							/>
							<Text className={SECTION_TITLE}>Notes</Text>
						</View>
						<Text className="text-sm text-text-main-light leading-[22px] dark:text-text-main-dark">
							{med.instructions}
						</Text>
					</View>
				) : null}

				{/* Inventory */}
				<View className={SECTION}>
					<View className="mb-3 flex-row items-center gap-2">
						<Ionicons name="cube-outline" size={18} className="text-primary" />
						<Text className={SECTION_TITLE}>Inventory</Text>
					</View>
					<View className="flex-row gap-3">
						<View className="flex-1">
							<Text className="mb-1 text-text-sub-light text-xs dark:text-text-sub-dark">
								Current Stock
							</Text>
							<Text
								className={`font-bold text-base ${isLowStock ? "text-red-600" : "text-text-main-light dark:text-text-main-dark"}`}
							>
								{med.currentStock} units
							</Text>
						</View>
						<View className="flex-1">
							<Text className="mb-1 text-text-sub-light text-xs dark:text-text-sub-dark">
								Alert Limit
							</Text>
							<Text className="font-bold text-base text-text-main-light dark:text-text-main-dark">
								{med.restockThreshold} units
							</Text>
						</View>
					</View>
					{isLowStock && (
						<View className="mt-3 flex-row items-center gap-2 rounded-[10px] bg-red-50 p-2.5">
							<Ionicons
								name="alert-circle"
								size={16}
								className="text-red-600"
							/>
							<Text className="flex-1 text-[13px] text-red-600">
								Stock is running low — consider restocking soon.
							</Text>
						</View>
					)}
				</View>

				{/* ESP32 device controls */}
				<MedicationDeviceControls
					medicationName={name}
					schedules={med.doseSchedules}
				/>

				{/* Delete */}
				<TouchableOpacity
					className="mt-1 flex-row items-center justify-center gap-2 rounded-2xl border border-red-200 bg-surface-light p-4 dark:bg-surface-dark"
					onPress={confirmDelete}
				>
					<Ionicons name="trash-outline" size={18} className="text-red-600" />
					<Text className="font-semibold text-red-600 text-sm">
						Delete Medication
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
}
