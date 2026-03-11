import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	Modal,
	ActivityIndicator,
} from "react-native";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useLanguage } from "@/context/LanguageContext";
import {
	useMedicationForm,
	FORMS,
	FREQUENCIES,
	MEAL_STATUSES,
	DOSE_COUNT_OPTIONS,
} from "@/hooks/useMedicationForm";
import { useAiNote } from "@/hooks/useAiNote";

export default function AddMedicationScreen() {
	const { isHighContrast, textSize } = useAccessibility();
	const { t } = useLanguage();
	const styles = makeStyles(isHighContrast, textSize);
	const form = useMedicationForm();
	const ai = useAiNote();
	const insets = useSafeAreaInsets();
	// footer sits ~88px tall; add insets.bottom for home-bar devices
	const scrollBottomPad = 88 + insets.bottom + 24;

	// Keep form.notes in sync when AI generates or user edits the note
	const handleAiNoteChange = (text: string) => {
		ai.setAiNote(text);
		form.setNotes(text);
	};

	const handleGenerateNote = () => {
		const drugName = form.brandName || form.name;
		ai.generateNote(drugName);
	};

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => form.router.back()}
					style={styles.backButton}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<Ionicons
						name="arrow-back"
						size={24}
						color={isHighContrast ? "black" : "#374151"}
					/>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>
					{form.isEditing ? t("med.edit") : t("med.new")}
				</Text>
				<View style={{ width: 40 }} />
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}
			>
				<ScrollView
					contentContainerStyle={[
						styles.content,
						{ paddingBottom: scrollBottomPad },
					]}
					showsVerticalScrollIndicator={false}
				>
					{/* Hero Icon */}
					<View style={styles.heroContainer}>
						<View style={styles.heroIconCircle}>
							<Ionicons name="medkit" size={40} color="#d99696" />
						</View>
						<Text style={styles.heroText}>
							{form.isEditing
								? "Update your medication details below."
								: "Add a new medication to your schedule."}
						</Text>
					</View>

					{/* 1. Basic Info Card */}
					<View style={styles.card}>
						<Text style={styles.cardTitle}>{t("med.infoTitle")}</Text>

						{/* Brand Name Input */}
						<View style={styles.inputContainer}>
							<Text style={styles.label}>{t("med.brandName")}</Text>
							<View style={styles.inputWrapper}>
								<Ionicons
									name="pricetag-outline"
									size={20}
									color="#9ca3af"
									style={styles.inputIcon}
								/>
								<TextInput
									style={[
										styles.input,
										{ fontSize: 18 * textSize, fontWeight: "600" },
									]}
									placeholder={t("med.brandPlaceholder")}
									value={form.brandName}
									onChangeText={form.setBrandName}
									placeholderTextColor="#9ca3af"
								/>
							</View>
						</View>

						{/* Generic Name Input */}
						<View style={styles.inputContainer}>
							<Text style={styles.label}>
								{t("med.genericName")}{" "}
								<Text style={{ color: "#9ca3af", fontWeight: "400" }}>
									{t("med.genericOptional")}
								</Text>
							</Text>
							<View style={styles.inputWrapper}>
								<Ionicons
									name="flask-outline"
									size={20}
									color="#9ca3af"
									style={styles.inputIcon}
								/>
								<TextInput
									style={styles.input}
									placeholder={t("med.genericPlaceholder")}
									value={form.name}
									onChangeText={form.setName}
									placeholderTextColor="#9ca3af"
								/>
							</View>
						</View>

						{/* Form Selection */}
						<View style={styles.inputContainer}>
							<Text style={styles.label}>{t("med.form")}</Text>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.chipScroll}
							>
								{FORMS.map((f) => (
									<TouchableOpacity
										key={f}
										style={[
											styles.chip,
											form.selectedForm === f && styles.chipSelected,
										]}
										onPress={() => form.setSelectedForm(f)}
									>
										<Text
											style={[
												styles.chipText,
												form.selectedForm === f && styles.chipTextSelected,
											]}
										>
											{f}
										</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
						</View>

						{/* Dosage Input */}
						<View style={styles.inputContainer}>
							<Text style={styles.label}>{t("med.dosage")}</Text>
							<View style={styles.inputWrapper}>
								<Ionicons
									name="eyedrop-outline"
									size={20}
									color="#9ca3af"
									style={styles.inputIcon}
								/>
								<TextInput
									style={styles.input}
									placeholder={t("med.dosagePlaceholder")}
									value={form.dosage}
									onChangeText={form.setDosage}
									placeholderTextColor="#9ca3af"
								/>
							</View>
						</View>
					</View>

					{/* 2. Schedule Card */}
					<View style={styles.card}>
						<Text style={styles.cardTitle}>{t("med.scheduleTitle")}</Text>

						{/* Dose Count Stepper */}
						<View style={styles.inputContainer}>
							<Text style={styles.label}>{t("med.doseCount")}</Text>
							<View style={styles.chipScroll}>
								{DOSE_COUNT_OPTIONS.map((count) => (
									<TouchableOpacity
										key={count}
										style={[
											styles.chip,
											{ minWidth: 56, alignItems: "center" },
											form.doseCount === count && styles.chipSelected,
										]}
										onPress={() => {
											form.setDoseCount(count);
										}}
									>
										<Text
											style={[
												styles.chipText,
												form.doseCount === count && styles.chipTextSelected,
											]}
										>
											{count}x
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>

						{/* Meal Status */}
						<View style={styles.inputContainer}>
							<Text style={styles.label}>{t("med.mealStatus")}</Text>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.chipScroll}
							>
								{MEAL_STATUSES.map((status) => (
									<TouchableOpacity
										key={status}
										style={[
											styles.chip,
											form.selectedMeal === status && styles.chipSelected,
										]}
										onPress={() => {
											form.setSelectedMeal(status);
										}}
									>
										<Text
											style={[
												styles.chipText,
												form.selectedMeal === status && styles.chipTextSelected,
											]}
										>
											{status === "BEFORE_MEAL"
												? t("med.mealBefore")
												: status === "AFTER_MEAL"
													? t("med.mealAfter")
													: status === "WITH_FOOD"
														? t("med.mealWith")
														: t("med.mealAny")}
										</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
						</View>

						{/* Frequency */}
						<View style={styles.inputContainer}>
							<Text style={styles.label}>{t("med.frequency")}</Text>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.chipScroll}
							>
								{FREQUENCIES.map((freq) => (
									<TouchableOpacity
										key={freq}
										style={[
											styles.chip,
											form.selectedFreq === freq && styles.chipSelected,
										]}
										onPress={() => form.setSelectedFreq(freq)}
									>
										<Text
											style={[
												styles.chipText,
												form.selectedFreq === freq && styles.chipTextSelected,
											]}
										>
											{freq === "DAILY"
												? t("med.freqDaily")
												: freq === "WEEKLY"
													? t("med.freqWeekly")
													: freq === "AS_NEEDED"
														? t("med.freqAsNeeded")
														: t("med.freqPeriodic")}
										</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
						</View>

						{/* Times */}
						<View style={styles.inputContainer}>
							<View style={styles.rowBetween}>
								<Text style={styles.label}>{t("med.reminderTimes")}</Text>
								<TouchableOpacity onPress={form.addTime}>
									<Text style={styles.addLink}>{t("med.addTime")}</Text>
								</TouchableOpacity>
							</View>

							<View style={styles.timesContainer}>
								{form.times.length === 0 && (
									<Text style={styles.emptyTimesText}>{t("med.noTimes")}</Text>
								)}
								{form.times.map((time, index) => (
									<View key={index} style={styles.timeChip}>
										<Ionicons name="time-outline" size={16} color="#374151" />
										<Text style={styles.timeChipText}>
											{time.toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</Text>
										<TouchableOpacity
											onPress={() => form.removeTime(index)}
											hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
										>
											<Ionicons name="close" size={16} color="#ef4444" />
										</TouchableOpacity>
									</View>
								))}
							</View>

							{/* Android: Native Picker */}
							{Platform.OS === "android" && form.showTimePicker && (
								<DateTimePicker
									value={form.tempDate}
									mode="time"
									display="default"
									onChange={form.onTimeChange}
								/>
							)}

							{/* iOS: Custom Bottom Sheet Modal */}
							{Platform.OS === "ios" && (
								<Modal
									transparent={true}
									visible={form.showTimePicker}
									animationType="fade"
									onRequestClose={() => form.setShowTimePicker(false)}
								>
									<TouchableOpacity
										style={styles.modalOverlay}
										activeOpacity={1}
										onPress={() => form.setShowTimePicker(false)}
									>
										<View
											style={styles.modalContent}
											onStartShouldSetResponder={() => true}
										>
											<View style={styles.modalHeader}>
												<TouchableOpacity
													onPress={() => form.setShowTimePicker(false)}
												>
													<Text style={styles.modalCancelText}>
														{t("timePicker.cancel")}
													</Text>
												</TouchableOpacity>
												<Text style={styles.modalTitle}>
													{t("timePicker.title")}
												</Text>
												<TouchableOpacity onPress={form.confirmTime}>
													<Text style={styles.modalConfirmText}>
														{t("timePicker.confirm")}
													</Text>
												</TouchableOpacity>
											</View>

											<View style={styles.pickerContainer}>
												<DateTimePicker
													value={form.tempDate}
													mode="time"
													display="spinner"
													onChange={form.onTimeChange}
													textColor={isHighContrast ? "black" : undefined}
												/>
											</View>
										</View>
									</TouchableOpacity>
								</Modal>
							)}
						</View>
					</View>

					{/* 3. Inventory Card */}
					<View style={styles.card}>
						<Text style={styles.cardTitle}>{t("med.stockTitle")}</Text>
						<View style={styles.row}>
							<View style={[styles.inputContainer, { flex: 1 }]}>
								<Text style={styles.label}>{t("med.currentStock")}</Text>
								<View style={styles.inputWrapper}>
									<TextInput
										style={styles.input}
										placeholder="0"
										value={form.stock}
										onChangeText={form.setStock}
										keyboardType="numeric"
										placeholderTextColor="#9ca3af"
									/>
								</View>
							</View>
							<View style={[styles.inputContainer, { flex: 1 }]}>
								<Text style={styles.label}>{t("med.alertLimit")}</Text>
								<View style={styles.inputWrapper}>
									<TextInput
										style={styles.input}
										placeholder="5"
										value={form.threshold}
										onChangeText={form.setThreshold}
										keyboardType="numeric"
										placeholderTextColor="#9ca3af"
									/>
								</View>
							</View>
						</View>
					</View>

					{/* 4. AI Note Card */}
					<View style={[styles.card, styles.aiCard]}>
						{/* Card header */}
						<View style={styles.aiCardHeader}>
							<View style={styles.aiIconBadge}>
								<Ionicons name="sparkles" size={18} color="#7c3aed" />
							</View>
							<View style={{ flex: 1 }}>
								<Text style={styles.cardTitle}>{t("med.aiNote.title")}</Text>
								<Text style={styles.aiCardSubtitle}>
									{t("med.aiNote.subtitle")}
								</Text>
							</View>
						</View>

						{/* Generate button */}
						<TouchableOpacity
							style={[
								styles.aiGenerateButton,
								(ai.isGenerating || (!form.brandName && !form.name)) &&
									styles.aiGenerateButtonDisabled,
							]}
							onPress={handleGenerateNote}
							disabled={ai.isGenerating || (!form.brandName && !form.name)}
						>
							{ai.isGenerating ? (
								<>
									<ActivityIndicator
										size="small"
										color="#7c3aed"
										style={{ marginRight: 8 }}
									/>
									<Text style={styles.aiGenerateButtonText}>
										{t("med.aiNote.generating")}
									</Text>
								</>
							) : (
								<>
									<Ionicons
										name="sparkles"
										size={16}
										color="#7c3aed"
										style={{ marginRight: 6 }}
									/>
									<Text style={styles.aiGenerateButtonText}>
										{ai.isAiGenerated
											? t("med.aiNote.regenerate")
											: t("med.aiNote.generate")}
									</Text>
								</>
							)}
						</TouchableOpacity>

						{/* Error state */}
						{ai.aiError && (
							<View style={styles.aiErrorBox}>
								<Ionicons
									name="alert-circle-outline"
									size={16}
									color="#dc2626"
								/>
								<Text style={[styles.aiErrorText, { fontSize: 13 * textSize }]}>
									{ai.aiError}
								</Text>
							</View>
						)}

						{/* Editable note area */}
						<View style={styles.inputContainer}>
							<Text style={styles.label}>{t("med.aiNote.label")}</Text>
							<TextInput
								style={[
									styles.aiNoteInput,
									{ fontSize: 15 * textSize },
									ai.isAiGenerated && styles.aiNoteInputPopulated,
								]}
								value={ai.aiNote || form.notes}
								onChangeText={handleAiNoteChange}
								placeholder={t("med.aiNote.placeholder")}
								placeholderTextColor="#9ca3af"
								multiline
								numberOfLines={5}
								textAlignVertical="top"
								editable
							/>
						</View>

						{/* AI disclaimer — only visible after generation */}
						{ai.isAiGenerated && (
							<View style={styles.aiDisclaimerBox}>
								<Ionicons
									name="information-circle-outline"
									size={14}
									color="#6b7280"
								/>
								<Text
									style={[styles.aiDisclaimerText, { fontSize: 11 * textSize }]}
								>
									{t("med.aiNote.disclaimer")}
								</Text>
							</View>
						)}
					</View>
				</ScrollView>

				{/* Footer Button */}
				<View style={styles.footer}>
					<TouchableOpacity
						style={[styles.saveButton, form.isSaving && styles.disabled]}
						onPress={form.handleSave}
						disabled={form.isSaving}
					>
						{form.isSaving ? (
							<ActivityIndicator color={isHighContrast ? "black" : "white"} />
						) : (
							<Text style={styles.saveText}>
								{form.isEditing ? t("med.saveChanges") : t("med.save")}
							</Text>
						)}
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

// todo: buradaki cssler nativewind;e cevrilsin
const makeStyles = (isHighContrast: boolean, textSize: number) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: isHighContrast ? "#ffffff" : "#f3f4f6",
		},
		header: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingHorizontal: 16,
			paddingVertical: 12,
			backgroundColor: isHighContrast ? "#ffffff" : "#f3f4f6",
		},
		backButton: {
			width: 40,
			height: 40,
			justifyContent: "center",
			alignItems: "center",
			borderRadius: 20,
			backgroundColor: isHighContrast ? "#e5e5e5" : "white",
		},
		headerTitle: {
			fontSize: 18 * textSize,
			fontWeight: "700",
			color: isHighContrast ? "#000000" : "#111827",
		},
		content: {
			padding: 16,
			gap: 20,
		},
		heroContainer: {
			alignItems: "center",
			marginBottom: 10,
		},
		heroIconCircle: {
			width: 80,
			height: 80,
			borderRadius: 40,
			backgroundColor: "#dbeafe",
			alignItems: "center",
			justifyContent: "center",
			marginBottom: 12,
		},
		heroText: {
			fontSize: 14 * textSize,
			color: isHighContrast ? "#000000" : "#6b7280",
			textAlign: "center",
		},
		card: {
			backgroundColor: isHighContrast ? "#ffffff" : "white",
			borderRadius: 24,
			padding: 20,
			borderWidth: isHighContrast ? 2 : 0,
			borderColor: "black",
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.05,
			shadowRadius: 8,
			elevation: 2,
			gap: 20,
		},
		cardTitle: {
			fontSize: 18 * textSize,
			fontWeight: "bold",
			color: isHighContrast ? "#000000" : "#1f2937",
			marginBottom: 4,
		},
		inputContainer: {
			gap: 8,
		},
		label: {
			fontSize: 13 * textSize,
			fontWeight: "600",
			color: isHighContrast ? "#000000" : "#6b7280",
			textTransform: "uppercase",
			letterSpacing: 0.5,
		},
		inputWrapper: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: isHighContrast ? "#ffffff" : "#f9fafb",
			borderWidth: isHighContrast ? 2 : 1,
			borderColor: isHighContrast ? "#000000" : "#e5e7eb",
			borderRadius: 16,
			paddingHorizontal: 16,
			height: 56,
		},
		inputIcon: {
			marginRight: 10,
		},
		input: {
			flex: 1,
			fontSize: 16 * textSize,
			color: isHighContrast ? "#000000" : "#111827",
			height: "100%",
		},
		chipScroll: {
			gap: 8,
			paddingRight: 20,
		},
		chip: {
			paddingHorizontal: 16,
			paddingVertical: 10,
			borderRadius: 20,
			backgroundColor: isHighContrast ? "#ffffff" : "#f3f4f6",
			borderWidth: isHighContrast ? 2 : 0,
			borderColor: "black",
		},
		chipSelected: {
			backgroundColor: isHighContrast ? "#ffcc00" : "#d99696",
		},
		chipText: {
			fontSize: 14 * textSize,
			fontWeight: "600",
			color: isHighContrast ? "#000000" : "#4b5563",
		},
		chipTextSelected: {
			color: isHighContrast ? "#000000" : "white",
		},
		rowBetween: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
		},
		addLink: {
			fontSize: 14 * textSize,
			fontWeight: "bold",
			color: "#d99696",
		},
		timesContainer: {
			flexDirection: "row",
			flexWrap: "wrap",
			gap: 10,
			marginTop: 8,
		},
		emptyTimesText: {
			fontSize: 14 * textSize,
			color: "#9ca3af",
			fontStyle: "italic",
		},
		timeChip: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: "#eff6ff",
			paddingHorizontal: 12,
			paddingVertical: 8,
			borderRadius: 12,
			borderWidth: 1,
			borderColor: "#bfdbfe",
			gap: 6,
		},
		timeChipText: {
			fontSize: 14 * textSize,
			fontWeight: "600",
			color: "#1e3a8a",
		},
		row: {
			flexDirection: "row",
			gap: 16,
		},
		footer: {
			position: "absolute",
			bottom: 0,
			left: 0,
			right: 0,
			backgroundColor: isHighContrast ? "#ffffff" : "white",
			paddingHorizontal: 24,
			paddingTop: 20,
			paddingBottom: 40,
			borderTopLeftRadius: 24,
			borderTopRightRadius: 24,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: -4 },
			shadowOpacity: 0.05,
			shadowRadius: 10,
			elevation: 10,
		},
		saveButton: {
			backgroundColor: isHighContrast ? "#ffcc00" : "#d99696",
			borderRadius: 16,
			paddingVertical: 18,
			alignItems: "center",
			borderWidth: isHighContrast ? 2 : 0,
			borderColor: "black",
			shadowColor: "#d99696",
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.2,
			shadowRadius: 8,
			elevation: 4,
		},
		disabled: {
			opacity: 0.7,
		},
		saveText: {
			color: isHighContrast ? "black" : "white",
			fontSize: 18 * textSize,
			fontWeight: "bold",
		},
		modalOverlay: {
			flex: 1,
			backgroundColor: "rgba(0,0,0,0.5)",
			justifyContent: "flex-end",
		},
		modalContent: {
			backgroundColor: isHighContrast ? "#ffffff" : "white",
			borderTopLeftRadius: 20,
			borderTopRightRadius: 20,
			paddingBottom: 40,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: -2 },
			shadowOpacity: 0.1,
			shadowRadius: 10,
			elevation: 10,
		},
		modalHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			padding: 16,
			borderBottomWidth: 1,
			borderBottomColor: isHighContrast ? "#000000" : "#f3f4f6",
		},
		modalTitle: {
			fontSize: 16 * textSize,
			fontWeight: "600",
			color: isHighContrast ? "#000000" : "#1f2937",
		},
		modalCancelText: {
			fontSize: 16 * textSize,
			color: isHighContrast ? "#000000" : "#6b7280",
		},
		modalConfirmText: {
			fontSize: 16 * textSize,
			fontWeight: "bold",
			color: "#d99696",
		},
		pickerContainer: {
			alignItems: "center",
			justifyContent: "center",
			paddingVertical: 20,
		},

		// ── AI Note Card ──────────────────────────────────────────────────────
		aiCard: {
			borderLeftWidth: 3,
			borderLeftColor: isHighContrast ? "#000000" : "#7c3aed",
		},
		aiCardHeader: {
			flexDirection: "row",
			alignItems: "center",
			gap: 12,
		},
		aiIconBadge: {
			width: 40,
			height: 40,
			borderRadius: 20,
			backgroundColor: isHighContrast ? "#e5e5e5" : "#ede9fe",
			alignItems: "center",
			justifyContent: "center",
		},
		aiCardSubtitle: {
			fontSize: 12 * textSize,
			color: isHighContrast ? "#000000" : "#6b7280",
			marginTop: 2,
		},
		aiGenerateButton: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: isHighContrast ? "#e5e5e5" : "#ede9fe",
			borderRadius: 14,
			paddingVertical: 14,
			paddingHorizontal: 20,
			borderWidth: isHighContrast ? 2 : 0,
			borderColor: "#7c3aed",
		},
		aiGenerateButtonDisabled: {
			opacity: 0.5,
		},
		aiGenerateButtonText: {
			fontSize: 15 * textSize,
			fontWeight: "700",
			color: isHighContrast ? "#000000" : "#7c3aed",
		},
		aiErrorBox: {
			flexDirection: "row",
			alignItems: "flex-start",
			gap: 8,
			backgroundColor: isHighContrast ? "#fff0f0" : "#fef2f2",
			borderRadius: 12,
			padding: 12,
			borderWidth: 1,
			borderColor: isHighContrast ? "#000000" : "#fecaca",
		},
		aiErrorText: {
			flex: 1,
			color: "#dc2626",
			fontWeight: "500",
		},
		aiNoteInput: {
			backgroundColor: isHighContrast ? "#ffffff" : "#f9fafb",
			borderWidth: isHighContrast ? 2 : 1,
			borderColor: isHighContrast ? "#000000" : "#e5e7eb",
			borderRadius: 16,
			padding: 16,
			color: isHighContrast ? "#000000" : "#111827",
			minHeight: 130,
			lineHeight: 24,
		},
		aiNoteInputPopulated: {
			borderColor: isHighContrast ? "#000000" : "#c4b5fd",
			backgroundColor: isHighContrast ? "#f9f9f9" : "#faf5ff",
		},
		aiDisclaimerBox: {
			flexDirection: "row",
			alignItems: "flex-start",
			gap: 6,
			backgroundColor: isHighContrast ? "#f5f5f5" : "#f3f4f6",
			borderRadius: 10,
			padding: 10,
		},
		aiDisclaimerText: {
			flex: 1,
			color: isHighContrast ? "#000000" : "#6b7280",
			lineHeight: 16,
		},
	});
