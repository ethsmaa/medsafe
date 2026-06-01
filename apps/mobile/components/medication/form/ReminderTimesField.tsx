import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
	type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import { useLanguage } from "@/context/LanguageContext";
import { FIELD_LABEL } from "./LabeledInput";

interface ReminderTimesFieldProps {
	times: Date[];
	onAdd: () => void;
	onRemove: (index: number) => void;
	showPicker: boolean;
	setShowPicker: (show: boolean) => void;
	tempDate: Date;
	onTimeChange: (event: DateTimePickerEvent, date?: Date) => void;
	onConfirm: () => void;
}

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

export const ReminderTimesField = ({
	times,
	onAdd,
	onRemove,
	showPicker,
	setShowPicker,
	tempDate,
	onTimeChange,
	onConfirm,
}: ReminderTimesFieldProps) => {
	const { t } = useLanguage();

	return (
		<View className="gap-2">
			<View className="flex-row items-center justify-between">
				<Text className={FIELD_LABEL}>{t("med.reminderTimes")}</Text>
				<TouchableOpacity onPress={onAdd}>
					<Text className="font-bold text-primary text-sm">
						{t("med.addTime")}
					</Text>
				</TouchableOpacity>
			</View>

			<View className="mt-2 flex-row flex-wrap gap-2.5">
				{times.length === 0 && (
					<Text className="text-sm text-text-sub-light italic dark:text-text-sub-dark">
						{t("med.noTimes")}
					</Text>
				)}
				{times.map((time, index) => (
					<View
						key={index}
						className="flex-row items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-900 dark:bg-blue-950/40"
					>
						<Ionicons
							name="time-outline"
							size={16}
							className="text-text-main-light dark:text-text-main-dark"
						/>
						<Text className="font-semibold text-blue-900 text-sm dark:text-blue-200">
							{time.toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</Text>
						<TouchableOpacity
							onPress={() => onRemove(index)}
							hitSlop={HIT_SLOP}
						>
							<Ionicons name="close" size={16} className="text-red-500" />
						</TouchableOpacity>
					</View>
				))}
			</View>

			{/* Android: native inline picker */}
			{Platform.OS === "android" && showPicker && (
				<DateTimePicker
					value={tempDate}
					mode="time"
					display="default"
					onChange={onTimeChange}
				/>
			)}

			{/* iOS: bottom-sheet modal */}
			{Platform.OS === "ios" && (
				<Modal
					transparent
					visible={showPicker}
					animationType="fade"
					onRequestClose={() => setShowPicker(false)}
				>
					<TouchableOpacity
						className="flex-1 justify-end bg-black/50"
						activeOpacity={1}
						onPress={() => setShowPicker(false)}
					>
						<View
							className="rounded-t-[20px] bg-surface-light pb-10 dark:bg-surface-dark"
							onStartShouldSetResponder={() => true}
						>
							<View className="flex-row items-center justify-between border-border-light border-b p-4 dark:border-border-dark">
								<TouchableOpacity onPress={() => setShowPicker(false)}>
									<Text className="text-base text-text-sub-light dark:text-text-sub-dark">
										{t("timePicker.cancel")}
									</Text>
								</TouchableOpacity>
								<Text className="font-semibold text-base text-text-main-light dark:text-text-main-dark">
									{t("timePicker.title")}
								</Text>
								<TouchableOpacity onPress={onConfirm}>
									<Text className="font-bold text-base text-primary">
										{t("timePicker.confirm")}
									</Text>
								</TouchableOpacity>
							</View>
							<View className="items-center justify-center py-5">
								<DateTimePicker
									value={tempDate}
									mode="time"
									display="spinner"
									onChange={onTimeChange}
								/>
							</View>
						</View>
					</TouchableOpacity>
				</Modal>
			)}
		</View>
	);
};
