import { Ionicons } from "@expo/vector-icons";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { fireDeviceAlarm, stopDeviceAlarm } from "@/lib/deviceApi";
import { minutesUntilNextDose } from "@/lib/medication-format";

interface MedicationDeviceControlsProps {
	medicationName: string;
	schedules: { timeOfDay: string }[] | undefined;
}

export const MedicationDeviceControls = ({
	medicationName,
	schedules,
}: MedicationDeviceControlsProps) => {
	const handleTest = async () => {
		try {
			const nextDoseMinutes = minutesUntilNextDose(schedules);
			await fireDeviceAlarm({ medication: medicationName, nextDoseMinutes });
			const h = Math.floor(nextDoseMinutes / 60);
			const m = nextDoseMinutes % 60;
			const eta = h > 0 ? `${h}s ${m}d` : `${m}d`;
			Alert.alert("Cihaz", `Alarm gönderildi — sonraki doz: ${eta}`);
		} catch (err) {
			Alert.alert("Cihaz hatası", (err as Error).message || "Bilinmeyen hata");
		}
	};

	const handleStop = async () => {
		try {
			await stopDeviceAlarm();
			Alert.alert("Cihaz", "Alarm durduruldu");
		} catch (err) {
			Alert.alert("Cihaz hatası", (err as Error).message || "Bilinmeyen hata");
		}
	};

	return (
		<View className="mt-2 flex-row gap-2.5">
			<TouchableOpacity
				className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 p-3.5 dark:bg-cyan-950/30"
				onPress={handleTest}
			>
				<Ionicons name="notifications" size={18} className="text-cyan-700" />
				<Text className="font-semibold text-cyan-700 text-sm">Test Et</Text>
			</TouchableOpacity>
			<TouchableOpacity
				className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-amber-300 bg-amber-100 p-3.5 dark:bg-amber-950/30"
				onPress={handleStop}
			>
				<Ionicons name="stop-circle" size={18} className="text-amber-700" />
				<Text className="font-semibold text-amber-700 text-sm">Durdur</Text>
			</TouchableOpacity>
		</View>
	);
};
