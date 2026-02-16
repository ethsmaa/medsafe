import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/theme";

import type { ScheduleItem } from "@/hooks/useMedicationSchedule";

interface NextDoseHeroProps {
	nextDose: ScheduleItem | null;
	onTakeNow: (id: string) => void;
	isTaking: boolean;
}

export function NextDoseHero({
	nextDose,
	onTakeNow,
	isTaking,
}: NextDoseHeroProps) {
	if (!nextDose) {
		return (
			<View
				style={{
					marginBottom: 32,
					alignItems: "center",
					justifyContent: "center",
					borderRadius: 24,
					padding: 32,
					backgroundColor: "#e2e8f0",
				}}
			>
				<Ionicons
					name="checkmark-circle"
					size={48}
					color={Colors.light.primary}
				/>
				<Text className="mt-4 font-bold text-xl text-primary dark:text-primary">
					You're all set!
				</Text>
				<Text className="text-base text-text-sub-light dark:text-text-sub-dark">
					No more meds scheduled for now.
				</Text>
			</View>
		);
	}

	const medicationName = nextDose.medication?.name || "Medication";
	const dosage = nextDose.medication?.dosage || "";
	const time = format(new Date(nextDose.scheduledTime), "h:mm a");
	const instructions = nextDose.medication?.instructions;

	return (
		<View className="mb-8 overflow-hidden rounded-3xl bg-surface-light shadow-sm dark:bg-surface-dark">
			<View className="bg-primary p-6">
				<Text className="mb-1 font-semibold text-white/80 text-xs tracking-widest uppercase">
					Next Dose
				</Text>
				<Text className="font-bold text-4xl text-white">{time}</Text>
			</View>

			<View className="p-6">
				<View className="mb-6 flex-row items-start justify-between">
					<View className="flex-1 pr-4">
						<Text className="font-bold text-2xl text-text-main-light dark:text-text-main-dark">
							{medicationName}
						</Text>
						<Text className="text-lg text-text-sub-light dark:text-text-sub-dark">
							{dosage}
						</Text>
						{instructions && (
							<View className="mt-2 flex-row items-center gap-2">
								<Ionicons
									name="information-circle-outline"
									size={16}
									color="#6b7280"
								/>
								<Text className="text-sm text-text-sub-light dark:text-text-sub-dark">
									{instructions}
								</Text>
							</View>
						)}
					</View>
					<View className="h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
						<Ionicons name="medkit" size={24} color="#3b82f6" />
					</View>
				</View>

				<TouchableOpacity
					onPress={() => onTakeNow(nextDose.prescriptionMedicationId)}
					disabled={isTaking}
					className={`h-14 w-full flex-row items-center justify-center gap-2 rounded-xl bg-primary shadow-sm active:opacity-90 ${
						isTaking ? "opacity-70" : ""
					}`}
				>
					{isTaking ? (
						<ActivityIndicator color="white" />
					) : (
						<>
							<Ionicons name="checkmark" size={20} color="white" />
							<Text className="font-bold text-lg text-white">
								Mark as Taken
							</Text>
						</>
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
}
