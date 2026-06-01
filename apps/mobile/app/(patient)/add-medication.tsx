import { Ionicons } from "@expo/vector-icons";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import { AiNoteCard } from "@/components/medication/form/AiNoteCard";
import { FormCard } from "@/components/medication/form/FormCard";
import { LabeledInput } from "@/components/medication/form/LabeledInput";
import { OptionChips } from "@/components/medication/form/OptionChips";
import { ReminderTimesField } from "@/components/medication/form/ReminderTimesField";
import { useLanguage } from "@/context/LanguageContext";
import { useAiNote } from "@/hooks/useAiNote";
import {
	DOSE_COUNT_OPTIONS,
	FORMS,
	FREQUENCIES,
	MEAL_STATUSES,
	useMedicationForm,
} from "@/hooks/useMedicationForm";

export default function AddMedicationScreen() {
	const { t } = useLanguage();
	const form = useMedicationForm();
	const ai = useAiNote();
	const insets = useSafeAreaInsets();
	// footer sits ~88px tall; add insets.bottom for home-bar devices
	const scrollBottomPad = 88 + insets.bottom + 24;

	const handleAiNoteChange = (text: string) => {
		ai.setAiNote(text);
		form.setNotes(text);
	};

	const handleGenerateNote = () => {
		ai.generateNote(form.brandName || form.name);
	};

	const mealLabel = (status: (typeof MEAL_STATUSES)[number]) =>
		status === "BEFORE_MEAL"
			? t("med.mealBefore")
			: status === "AFTER_MEAL"
				? t("med.mealAfter")
				: status === "WITH_FOOD"
					? t("med.mealWith")
					: t("med.mealAny");

	const freqLabel = (freq: (typeof FREQUENCIES)[number]) =>
		freq === "DAILY"
			? t("med.freqDaily")
			: freq === "WEEKLY"
				? t("med.freqWeekly")
				: freq === "AS_NEEDED"
					? t("med.freqAsNeeded")
					: t("med.freqPeriodic");

	return (
		<SafeAreaView
			className="flex-1 bg-background-light dark:bg-background-dark"
			edges={["top"]}
		>
			{/* Header */}
			<View className="flex-row items-center justify-between bg-background-light px-4 py-3 dark:bg-background-dark">
				<TouchableOpacity
					onPress={() => form.router.back()}
					className="h-10 w-10 items-center justify-center rounded-full bg-surface-light dark:bg-surface-dark"
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<Ionicons
						name="arrow-back"
						size={24}
						className="text-text-main-light dark:text-text-main-dark"
					/>
				</TouchableOpacity>
				<Text className="font-bold text-lg text-text-main-light dark:text-text-main-dark">
					{form.isEditing ? t("med.edit") : t("med.new")}
				</Text>
				<View className="w-10" />
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
			>
				<ScrollView
					contentContainerClassName="gap-5 p-4"
					contentContainerStyle={{ paddingBottom: scrollBottomPad }}
					showsVerticalScrollIndicator={false}
				>
					{/* Hero */}
					<View className="mb-2.5 items-center">
						<View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-blue-100">
							<Ionicons name="medkit" size={40} className="text-primary" />
						</View>
						<Text className="text-center text-sm text-text-sub-light dark:text-text-sub-dark">
							{form.isEditing
								? "Update your medication details below."
								: "Add a new medication to your schedule."}
						</Text>
					</View>

					{/* 1. Basic Info */}
					<FormCard title={t("med.infoTitle")}>
						<LabeledInput
							label={t("med.brandName")}
							icon="pricetag-outline"
							value={form.brandName}
							onChangeText={form.setBrandName}
							placeholder={t("med.brandPlaceholder")}
							emphasized
						/>
						<LabeledInput
							label={t("med.genericName")}
							optionalText={t("med.genericOptional")}
							icon="flask-outline"
							value={form.name}
							onChangeText={form.setName}
							placeholder={t("med.genericPlaceholder")}
						/>
						<OptionChips
							label={t("med.form")}
							options={FORMS}
							selected={form.selectedForm}
							onSelect={form.setSelectedForm}
						/>
						<LabeledInput
							label={t("med.dosage")}
							icon="eyedrop-outline"
							value={form.dosage}
							onChangeText={form.setDosage}
							placeholder={t("med.dosagePlaceholder")}
						/>
					</FormCard>

					{/* 2. Schedule */}
					<FormCard title={t("med.scheduleTitle")}>
						<OptionChips
							label={t("med.doseCount")}
							options={DOSE_COUNT_OPTIONS}
							selected={form.doseCount}
							onSelect={form.setDoseCount}
							renderLabel={(c) => `${c}x`}
							scroll={false}
						/>
						<OptionChips
							label={t("med.mealStatus")}
							options={MEAL_STATUSES}
							selected={form.selectedMeal}
							onSelect={form.setSelectedMeal}
							renderLabel={mealLabel}
						/>
						<OptionChips
							label={t("med.frequency")}
							options={FREQUENCIES}
							selected={form.selectedFreq}
							onSelect={form.setSelectedFreq}
							renderLabel={freqLabel}
						/>
						<ReminderTimesField
							times={form.times}
							onAdd={form.addTime}
							onRemove={form.removeTime}
							showPicker={form.showTimePicker}
							setShowPicker={form.setShowTimePicker}
							tempDate={form.tempDate}
							onTimeChange={form.onTimeChange}
							onConfirm={form.confirmTime}
						/>
					</FormCard>

					{/* 3. Inventory */}
					<FormCard title={t("med.stockTitle")}>
						<View className="flex-row gap-4">
							<View className="flex-1">
								<LabeledInput
									label={t("med.currentStock")}
									value={form.stock}
									onChangeText={form.setStock}
									placeholder="0"
									keyboardType="numeric"
								/>
							</View>
							<View className="flex-1">
								<LabeledInput
									label={t("med.alertLimit")}
									value={form.threshold}
									onChangeText={form.setThreshold}
									placeholder="5"
									keyboardType="numeric"
								/>
							</View>
						</View>
					</FormCard>

					{/* 4. AI Note */}
					<AiNoteCard
						isGenerating={ai.isGenerating}
						error={ai.aiError}
						isGenerated={ai.isAiGenerated}
						noteValue={ai.aiNote || form.notes}
						canGenerate={Boolean(form.brandName || form.name)}
						onGenerate={handleGenerateNote}
						onNoteChange={handleAiNoteChange}
					/>
				</ScrollView>

				{/* Footer */}
				<View className="absolute right-0 bottom-0 left-0 rounded-t-3xl bg-surface-light px-6 pt-5 pb-10 shadow-lg dark:bg-surface-dark">
					<TouchableOpacity
						className={`items-center rounded-2xl bg-primary py-[18px] shadow-lg ${form.isSaving ? "opacity-70" : ""}`}
						onPress={form.handleSave}
						disabled={form.isSaving}
					>
						{form.isSaving ? (
							<ActivityIndicator color="white" />
						) : (
							<Text className="font-bold text-lg text-white">
								{form.isEditing ? t("med.saveChanges") : t("med.save")}
							</Text>
						)}
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
