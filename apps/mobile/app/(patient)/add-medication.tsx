import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Modal,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useLanguage } from "@/context/LanguageContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useTRPC } from "@/lib/trpc";
import { suggestTimes, DOSE_COUNT_OPTIONS } from "@/constants/time-suggestions";
import {
	MEDICATION_FORMS as FORMS,
	MEDICATION_FREQUENCIES as FREQUENCIES,
	MEAL_STATUSES,
} from "@/constants/medication";

export default function AddMedicationScreen() {
	const router = useRouter();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { isHighContrast, textSize } = useAccessibility();
	const { t } = useLanguage();
	const styles = makeStyles(isHighContrast, textSize);
	// Parse ID if editing, or scanResult if coming from scanner
	const { id, scanResult } = useLocalSearchParams<{
		id: string;
		scanResult: string;
	}>();
	const isEditing = !!id;

	const { scheduleMedicationReminder } = useNotifications();

	// Fetch data if editing
	// ideally we use a specific query, but for now we can find from cache if available or fetch cabinet
	// simpler to just use cabinet query finding
	const cabinetQuery = useQuery(trpc.medication.getMyCabinet.queryOptions({}));
	const existingMed = cabinetQuery.data?.find((m) => m.id === id);

	// Form State
	const [name, setName] = useState("");
	const [brandName, setBrandName] = useState("");
	const [dosage, setDosage] = useState("");
	const [stock, setStock] = useState("");
	const [threshold, setThreshold] = useState("5");
	const [doseCount, setDoseCount] = useState(1);
	const [selectedFreq, setSelectedFreq] =
		useState<(typeof FREQUENCIES)[number]>("DAILY");
	const [selectedForm, setSelectedForm] =
		useState<(typeof FORMS)[number]>("TABLET");
	const [selectedMeal, setSelectedMeal] =
		useState<(typeof MEAL_STATUSES)[number]>("ANY");
	const [times, setTimes] = useState<Date[]>([]);
	const [timesManuallyEdited, setTimesManuallyEdited] = useState(false);

	// Pre-fill from scan result (OCR)
	useEffect(() => {
		if (scanResult && !isEditing) {
			try {
				const scan = JSON.parse(scanResult);
				if (scan.nameGeneric) setName(scan.nameGeneric);
				if (scan.nameBrand) setBrandName(scan.nameBrand);
				if (scan.dosageAmount) setDosage(scan.dosageAmount);
				if (scan.form && FORMS.includes(scan.form)) setSelectedForm(scan.form);
				if (scan.frequency && FREQUENCIES.includes(scan.frequency))
					setSelectedFreq(scan.frequency);
				if (scan.mealStatus && MEAL_STATUSES.includes(scan.mealStatus))
					setSelectedMeal(scan.mealStatus);
				const count = scan.dailyDoseCount ?? 1;
				setDoseCount(count);
				// Auto-suggest times from scan data
				const meal = scan.mealStatus ?? "ANY";
				setTimes(suggestTimes(count, meal));
			} catch {
				// Invalid scan result, ignore
			}
		}
	}, [scanResult]);

	// Pre-fill from existing medication (editing)
	useEffect(() => {
		if (isEditing && existingMed) {
			setName(existingMed.medication.nameGeneric || "");
			setBrandName(existingMed.medication.nameBrand || "");
			setDosage(existingMed.dosageAmount);
			setStock(existingMed.currentStock.toString());
			setThreshold(existingMed.restockThreshold.toString());
			// Cast types if needed or ensuring backend matches frontend enums
			setSelectedFreq(existingMed.frequency as any);
			setSelectedForm(existingMed.form as any);
			setSelectedMeal(existingMed.mealStatus as any);

			if (existingMed.doseSchedules) {
				const loadedTimes = existingMed.doseSchedules.map((s) => {
					const [h, m] = s.timeOfDay.split(":").map(Number);
					const d = new Date();
					d.setHours(h, m, 0, 0);
					return d;
				});
				setTimes(loadedTimes);
			}
		}
	}, [isEditing, existingMed]);

	const addMutation = useMutation({
		...trpc.medication.addMedicationManual.mutationOptions(),
		onSuccess: (data, variables) => {
			// Schedule notifications
			variables.times.forEach((time) => {
				const [h, m] = time.split(":").map(Number);
				scheduleMedicationReminder(
					`Time to take ${variables.nameBrand || variables.nameGeneric}`,
					`Dosage: ${variables.dosageAmount}`,
					h,
					m,
					{ medicationId: data.id },
				);
			});

			Alert.alert("Success", "Medication added and reminders set.");
			queryClient.invalidateQueries(trpc.medication.getMyCabinet.pathFilter());
			router.back();
		},
		onError: (err) => {
			Alert.alert("Error", err.message);
		},
	});

	const updateMutation = useMutation({
		...trpc.medication.update.mutationOptions(),
		onSuccess: () => {
			Alert.alert("Success", "Medication updated.");
			queryClient.invalidateQueries(trpc.medication.getMyCabinet.pathFilter());
			router.back();
		},
		onError: (err) => {
			Alert.alert("Error", err.message);
		},
	});

	const handleSave = () => {
		if (!brandName && !name) {
			Alert.alert(t("validation.error"), t("validation.nameRequired"));
			return;
		}
		if (!dosage) {
			Alert.alert(t("validation.error"), t("validation.dosageRequired"));
			return;
		}

		// Convert times to HH:mm strings
		const formattedTimes = times.map((d) => {
			const hours = d.getHours().toString().padStart(2, "0");
			const minutes = d.getMinutes().toString().padStart(2, "0");
			return `${hours}:${minutes}`;
		});

		if (isEditing && id) {
			updateMutation.mutate({
				id,
				dosageAmount: dosage,
				frequency: selectedFreq,
				currentStock: Number.parseInt(stock) || 0,
				restockThreshold: Number.parseInt(threshold) || 5,
				form: selectedForm,
				mealStatus: selectedMeal,
				times: formattedTimes,
				instructions: "",
			});
		} else {
			addMutation.mutate({
				nameGeneric: name || undefined,
				nameBrand: brandName || undefined,
				dosageAmount: dosage,
				frequency: selectedFreq,
				currentStock: Number.parseInt(stock) || 0,
				restockThreshold: Number.parseInt(threshold) || 5,
				form: selectedForm,
				mealStatus: selectedMeal,
				times: formattedTimes,
				instructions: "",
			});
		}
	};

	const [showTimePicker, setShowTimePicker] = useState(false);
	const [tempDate, setTempDate] = useState(new Date());

	const onTimeChange = (event: any, selectedDate?: Date) => {
		if (Platform.OS === "android") {
			setShowTimePicker(false);
			if (event.type === "set" && selectedDate) {
				setTimes([...times, selectedDate]);
			}
		} else {
			// iOS (Spinner in Modal)
			if (selectedDate) {
				setTempDate(selectedDate);
			}
		}
	};

	const addTime = () => {
		setTempDate(new Date());
		setShowTimePicker(true);
	};

	const confirmTime = () => {
		setTimes([...times, tempDate]);
		setTimesManuallyEdited(true);
		setShowTimePicker(false);
	};

	const removeTime = (index: number) => {
		const newTimes = [...times];
		newTimes.splice(index, 1);
		setTimes(newTimes);
		setTimesManuallyEdited(true);
	};

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
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
					{isEditing ? t("med.edit") : t("med.new")}
				</Text>
				<View style={{ width: 40 }} />
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}
			>
				<ScrollView
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					{/* Hero Icon */}
					<View style={styles.heroContainer}>
						<View style={styles.heroIconCircle}>
							<Ionicons name="medkit" size={40} color="#d99696" />
						</View>
						<Text style={styles.heroText}>
							{isEditing
								? "Update your medication details below."
								: "Add a new medication to your schedule."}
						</Text>
					</View>

					{/* 1. Basic Info Card */}
					<View style={styles.card}>
						<Text style={styles.cardTitle}>{t("med.infoTitle")}</Text>

						{/* Brand Name Input — first, most recognizable */}
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
									value={brandName}
									onChangeText={setBrandName}
									placeholderTextColor="#9ca3af"
								/>
							</View>
						</View>

						{/* Generic Name Input — secondary */}
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
									value={name}
									onChangeText={setName}
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
								{FORMS.map((form) => (
									<TouchableOpacity
										key={form}
										style={[
											styles.chip,
											selectedForm === form && styles.chipSelected,
										]}
										onPress={() => setSelectedForm(form)}
									>
										<Text
											style={[
												styles.chipText,
												selectedForm === form && styles.chipTextSelected,
											]}
										>
											{form}
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
									value={dosage}
									onChangeText={setDosage}
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
											doseCount === count && styles.chipSelected,
										]}
										onPress={() => {
											setDoseCount(count);
											if (!timesManuallyEdited) {
												setTimes(suggestTimes(count, selectedMeal));
											}
										}}
									>
										<Text
											style={[
												styles.chipText,
												doseCount === count && styles.chipTextSelected,
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
											selectedMeal === status && styles.chipSelected,
										]}
										onPress={() => {
											setSelectedMeal(status);
											if (!timesManuallyEdited) {
												setTimes(suggestTimes(doseCount, status));
											}
										}}
									>
										<Text
											style={[
												styles.chipText,
												selectedMeal === status && styles.chipTextSelected,
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

						{/* Frequency (hidden if DAILY — most common) */}
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
											selectedFreq === freq && styles.chipSelected,
										]}
										onPress={() => setSelectedFreq(freq)}
									>
										<Text
											style={[
												styles.chipText,
												selectedFreq === freq && styles.chipTextSelected,
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
								<TouchableOpacity onPress={addTime}>
									<Text style={styles.addLink}>{t("med.addTime")}</Text>
								</TouchableOpacity>
							</View>

							<View style={styles.timesContainer}>
								{times.length === 0 && (
									<Text style={styles.emptyTimesText}>{t("med.noTimes")}</Text>
								)}
								{times.map((time, index) => (
									<View key={index} style={styles.timeChip}>
										<Ionicons name="time-outline" size={16} color="#374151" />
										<Text style={styles.timeChipText}>
											{time.toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</Text>
										<TouchableOpacity
											onPress={() => removeTime(index)}
											hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
										>
											<Ionicons name="close" size={16} color="#ef4444" />
										</TouchableOpacity>
									</View>
								))}
							</View>

							{/* Android: Native Picker (No Modal) */}
							{Platform.OS === "android" && showTimePicker && (
								<DateTimePicker
									value={tempDate}
									mode="time"
									display="default"
									onChange={onTimeChange}
								/>
							)}

							{/* iOS: Custom Bottom Sheet Modal */}
							{Platform.OS === "ios" && (
								<Modal
									transparent={true}
									visible={showTimePicker}
									animationType="fade"
									onRequestClose={() => setShowTimePicker(false)}
								>
									<TouchableOpacity
										style={styles.modalOverlay}
										activeOpacity={1}
										onPress={() => setShowTimePicker(false)}
									>
										<View
											style={styles.modalContent}
											onStartShouldSetResponder={() => true}
										>
											<View style={styles.modalHeader}>
												<TouchableOpacity
													onPress={() => setShowTimePicker(false)}
												>
													<Text style={styles.modalCancelText}>
														{t("timePicker.cancel")}
													</Text>
												</TouchableOpacity>
												<Text style={styles.modalTitle}>
													{t("timePicker.title")}
												</Text>
												<TouchableOpacity onPress={confirmTime}>
													<Text style={styles.modalConfirmText}>
														{t("timePicker.confirm")}
													</Text>
												</TouchableOpacity>
											</View>

											<View style={styles.pickerContainer}>
												<DateTimePicker
													value={tempDate}
													mode="time"
													display="spinner"
													onChange={onTimeChange}
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
										value={stock}
										onChangeText={setStock}
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
										value={threshold}
										onChangeText={setThreshold}
										keyboardType="numeric"
										placeholderTextColor="#9ca3af"
									/>
								</View>
							</View>
						</View>
					</View>

					<View style={{ height: 100 }} />
				</ScrollView>

				{/* Footer Button */}
				<View style={styles.footer}>
					<TouchableOpacity
						style={[
							styles.saveButton,
							(addMutation.isPending || updateMutation.isPending) &&
								styles.disabled,
						]}
						onPress={handleSave}
						disabled={addMutation.isPending || updateMutation.isPending}
					>
						{addMutation.isPending || updateMutation.isPending ? (
							<ActivityIndicator color={isHighContrast ? "black" : "white"} />
						) : (
							<Text style={styles.saveText}>
								{isEditing ? t("med.saveChanges") : t("med.save")}
							</Text>
						)}
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
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
			height: 56, // Fixed height for consistency
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
			backgroundColor: isHighContrast ? "#ffffff" : "#f3f4f6", // Default gray
			borderWidth: isHighContrast ? 2 : 0,
			borderColor: "black",
		},
		chipSelected: {
			backgroundColor: isHighContrast ? "#ffcc00" : "#d99696", // Primary Blue
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
			backgroundColor: "#eff6ff", // Light blue bg
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
	});
