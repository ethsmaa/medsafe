import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	RefreshControl,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "@/context/LanguageContext";
import { useMedicationAction } from "@/hooks/useMedicationAction";
import { useTRPC } from "@/lib/trpc";

const MED_CARD =
	"mb-3 flex-row items-center rounded-2xl border border-border-light bg-surface-light p-4 shadow-sm dark:border-border-dark dark:bg-surface-dark";
const MED_CARD_SELECTED =
	"border-2 border-primary bg-primary-soft-light dark:bg-primary-soft-dark";

export default function CabinetScreen() {
	const { t } = useLanguage();
	const router = useRouter();
	const trpc = useTRPC();
	const { deleteMedication, deleteManyMedications } = useMedicationAction({
		onSuccess: () => {
			setIsSelectionMode(false);
			setSelectedIds(new Set());
		},
	});

	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const cabinetQuery = useQuery(trpc.medication.getMyCabinet.queryOptions({}));

	const onRefresh = async () => {
		await cabinetQuery.refetch();
	};

	const toggleSelection = useCallback((id: string) => {
		setSelectedIds((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			if (newSet.size === 0) {
				setIsSelectionMode(false);
			}
			return newSet;
		});
	}, []);

	const handleLongPress = (id: string) => {
		if (!isSelectionMode) {
			setIsSelectionMode(true);
			setSelectedIds(new Set([id]));
		}
	};

	const handlePress = (id: string) => {
		if (isSelectionMode) {
			toggleSelection(id);
		} else {
			router.push({
				pathname: "/(patient)/medication-detail",
				params: { id },
			});
		}
	};

	const handleDeleteSelected = () => {
		if (selectedIds.size === 0) return;
		deleteManyMedications(Array.from(selectedIds));
	};

	const cancelSelection = () => {
		setIsSelectionMode(false);
		setSelectedIds(new Set());
	};

	return (
		<SafeAreaView
			className="flex-1 bg-background-light dark:bg-background-dark"
			edges={["top"]}
		>
			<View className="flex-row items-center justify-between bg-background-light p-4 dark:bg-background-dark">
				{isSelectionMode ? (
					<View className="flex-1 flex-row items-center justify-between">
						<TouchableOpacity onPress={cancelSelection} className="p-2">
							<Text className="font-semibold text-base text-error-light dark:text-error-dark">
								{t("cabinet.cancelSelection")}
							</Text>
						</TouchableOpacity>
						<Text className="font-bold text-2xl text-text-main-light dark:text-text-main-dark">
							{selectedIds.size} {t("cabinet.selected")}
						</Text>
						<TouchableOpacity onPress={handleDeleteSelected} className="p-2">
							<Ionicons
								name="trash"
								size={24}
								className="text-error-light dark:text-error-dark"
							/>
						</TouchableOpacity>
					</View>
				) : (
					<>
						<Text className="font-bold text-2xl text-text-main-light dark:text-text-main-dark">
							{t("cabinet.title")}
						</Text>
						<TouchableOpacity
							className="rounded-full bg-primary p-2"
							onPress={() =>
								Alert.alert(t("med.new"), t("cabinet.addFirst"), [
									{
										text: `📝 ${t("cabinet.addManual")}`,
										onPress: () => router.push("/(patient)/add-medication"),
									},
									{
										text: `📷 ${t("cabinet.scanBox")}`,
										onPress: () => router.push("/(patient)/scan-medication"),
									},
									{ text: t("common.cancel"), style: "cancel" },
								])
							}
						>
							<Ionicons name="add" size={24} className="text-white" />
						</TouchableOpacity>
					</>
				)}
			</View>

			{cabinetQuery.isLoading ? (
				<ActivityIndicator size="large" color="#d99696" />
			) : cabinetQuery.data?.length === 0 ? (
				<View className="flex-1 items-center justify-center">
					<Text className="text-base text-text-sub-light dark:text-text-sub-dark">
						{t("cabinet.empty")}
					</Text>
				</View>
			) : (
				<FlatList
					data={cabinetQuery.data}
					keyExtractor={(item) => item.id}
					contentContainerClassName="gap-3 p-4"
					refreshControl={
						<RefreshControl
							refreshing={cabinetQuery.isLoading}
							onRefresh={onRefresh}
						/>
					}
					renderItem={({ item }) => {
						const isSelected = selectedIds.has(item.id);
						return (
							<TouchableOpacity
								activeOpacity={0.7}
								onPress={() => handlePress(item.id)}
								onLongPress={() => handleLongPress(item.id)}
								className={`${MED_CARD} ${isSelected ? MED_CARD_SELECTED : ""}`}
							>
								{isSelectionMode && (
									<View className="mr-3">
										<Ionicons
											name={isSelected ? "checkbox" : "square-outline"}
											size={24}
											className={
												isSelected
													? "text-primary"
													: "text-text-sub-light dark:text-text-sub-dark"
											}
										/>
									</View>
								)}
								<View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-primary-soft-light dark:bg-primary-soft-dark">
									<Ionicons name="medkit" size={24} className="text-primary" />
								</View>
								<View className="flex-1">
									<Text className="mb-1 font-bold text-base text-text-main-light dark:text-text-main-dark">
										{item.medication.nameBrand || item.medication.nameGeneric}
									</Text>
									<Text className="text-sm text-text-sub-light dark:text-text-sub-dark">
										{item.dosageAmount} • {item.frequency}
									</Text>
								</View>
								{!isSelectionMode && (
									<View className="items-end gap-2">
										<View className="rounded-xl bg-background-light px-3 py-1.5 dark:bg-primary-soft-dark">
											<Text className="font-semibold text-text-sub-light text-xs dark:text-text-sub-dark">
												{item.currentStock} left
											</Text>
										</View>
										{item.instructions ? (
											<Ionicons
												name="document-text"
												size={16}
												className="text-primary"
											/>
										) : null}
										<TouchableOpacity
											accessibilityLabel={`Options for ${item.medication.nameBrand || item.medication.nameGeneric}`}
											accessibilityHint="Double tap to edit or delete this medication"
											hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
											onPress={() => {
												Alert.alert(
													t("med.infoTitle"),
													`${item.medication.nameBrand || item.medication.nameGeneric}`,
													[
														{ text: t("common.cancel"), style: "cancel" },
														{
															text: t("common.edit"),
															onPress: () => {
																router.push({
																	pathname: "/(patient)/add-medication",
																	params: { id: item.id },
																});
															},
														},
														{
															text: t("common.delete"),
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
												className="text-text-sub-light dark:text-text-sub-dark"
											/>
										</TouchableOpacity>
									</View>
								)}
							</TouchableOpacity>
						);
					}}
				/>
			)}
		</SafeAreaView>
	);
}
