import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
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
import { useTRPC } from "@/lib/trpc";

const FREQUENCIES = ["DAILY", "WEEKLY", "AS_NEEDED", "PERIODIC"] as const;
const FORMS = [
	"TABLET",
	"CAPSULE",
	"SYRUP",
	"CREAM",
	"INJECTION",
	"OTHER",
] as const;
const MEAL_STATUSES = [
	"BEFORE_MEAL",
	"AFTER_MEAL",
	"WITH_FOOD",
	"ANY",
] as const;

import { useNotifications } from "@/hooks/useNotifications";

export default function AddMedicationScreen() {
	const router = useRouter();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { isHighContrast, textSize } = useAccessibility();
	const styles = makeStyles(isHighContrast, textSize);
	// Parse ID if editing
	const { id } = useLocalSearchParams<{ id: string }>();
	const isEditing = !!id;

	const { scheduleMedicationReminder } = useNotifications();

	// Fetch data if editing
	// ideally we use a specific query, but for now we can find from cache if available or fetch cabinet
	// simpler to just use cabinet query finding
	const cabinetQuery = useQuery(trpc.medication.getMyCabinet.queryOptions({}));
	const existingMed = cabinetQuery.data?.find((m) => m.id === id);

	// Form State
	const [name, setName] = useState("");
	const [dosage, setDosage] = useState("");
	const [stock, setStock] = useState("");
	const [threshold, setThreshold] = useState("5");
	const [selectedFreq, setSelectedFreq] =
		useState<(typeof FREQUENCIES)[number]>("DAILY");
	const [selectedForm, setSelectedForm] =
		useState<(typeof FORMS)[number]>("TABLET");
	const [selectedMeal, setSelectedMeal] =
		useState<(typeof MEAL_STATUSES)[number]>("ANY");
	const [times, setTimes] = useState<Date[]>([]);
	const [showTimePicker, setShowTimePicker] = useState(false);

	// Pre-fill effect
	useEffect(() => {
		if (isEditing && existingMed) {
			setName(existingMed.medication.nameGeneric);
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
					`Time to take ${variables.nameGeneric}`,
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
		if (!name || !dosage) {
			Alert.alert(
				"Error",
				"Please fill in the required fields (Name, Dosage).",
			);
			return;
		}

		// Convert times to HH:mm strings
		const formattedTimes = times.map((t) => {
			const hours = t.getHours().toString().padStart(2, "0");
			const minutes = t.getMinutes().toString().padStart(2, "0");
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
				nameGeneric: name,
				dosageAmount: dosage,
				frequency: selectedFreq,
				currentStock: Number.parseInt(stock) || 0,
				restockThreshold: Number.parseInt(threshold) || 5,
				form: selectedForm,
				mealStatus: selectedMeal,
				times: formattedTimes,
				instructions: "", // Optional
			});
		}
	};

	const onTimeChange = (event: any, selectedDate?: Date) => {
		const currentDate = selectedDate || new Date();
		setShowTimePicker(Platform.OS === "ios"); // Keep open on iOS, close on Android
		if (event.type === "set" || Platform.OS === "ios") {
			// Add to list if not strictly duplicate (basic check)
			// For better UX we might want to replace the last one if editing
			// But here we just add new ones via a generic button flow
			if (event.type === "set") {
				setTimes([...times, currentDate]);
				if (Platform.OS !== "ios") setShowTimePicker(false);
			}
		} else {
			setShowTimePicker(false);
		}
	};

	const addTime = () => {
		setShowTimePicker(true);
	};

	const removeTime = (index: number) => {
		const newTimes = [...times];
		newTimes.splice(index, 1);
		setTimes(newTimes);
	};

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}
				>
					<Text style={styles.backText}>Cancel</Text>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Add Medication</Text>
				<View style={{ width: 60 }} />
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}
			>
				<ScrollView contentContainerStyle={styles.content}>
					{/* Basic Info */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Basic Info</Text>
						<View style={styles.formGroup}>
							<Text style={styles.label}>Name</Text>
							<TextInput
								style={styles.input}
								placeholder="e.g. Aspirin"
								value={name}
								onChangeText={setName}
								placeholderTextColor={isHighContrast ? "#666" : "#9ca3af"}
							/>
						</View>
						<View style={styles.formGroup}>
							<Text style={styles.label}>Dosage / Strength</Text>
							<TextInput
								style={styles.input}
								placeholder="e.g. 500mg"
								value={dosage}
								onChangeText={setDosage}
								placeholderTextColor={isHighContrast ? "#666" : "#9ca3af"}
							/>
						</View>
						<View style={styles.formGroup}>
							<Text style={styles.label}>Form</Text>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.chipContainer}
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
					</View>

					{/* Scheduling */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Scheduling</Text>
						<View style={styles.formGroup}>
							<Text style={styles.label}>Frequency</Text>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.chipContainer}
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
											{freq.replace("_", " ")}
										</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
						</View>

						<View style={styles.formGroup}>
							<Text style={styles.label}>Time of Day</Text>
							<View style={styles.timesList}>
								{times.map((t, index) => (
									<View key={index} style={styles.timeBadge}>
										<Text style={styles.timeText}>
											{t.toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</Text>
										<TouchableOpacity onPress={() => removeTime(index)}>
											<Ionicons
												name="close-circle"
												size={20}
												color={isHighContrast ? "black" : "#6b7280"}
											/>
										</TouchableOpacity>
									</View>
								))}
								<TouchableOpacity
									style={styles.addTimeButton}
									onPress={addTime}
								>
									<Ionicons
										name="add"
										size={20}
										color={isHighContrast ? "black" : "#2563eb"}
									/>
									<Text style={styles.addTimeText}>Add Time</Text>
								</TouchableOpacity>
							</View>
							{showTimePicker && (
								<DateTimePicker
									value={new Date()}
									mode="time"
									display="default"
									onChange={onTimeChange}
								/>
							)}
						</View>

						<View style={styles.formGroup}>
							<Text style={styles.label}>Details</Text>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.chipContainer}
							>
								{MEAL_STATUSES.map((status) => (
									<TouchableOpacity
										key={status}
										style={[
											styles.chip,
											selectedMeal === status && styles.chipSelected,
										]}
										onPress={() => setSelectedMeal(status)}
									>
										<Text
											style={[
												styles.chipText,
												selectedMeal === status && styles.chipTextSelected,
											]}
										>
											{status.replace("_", " ")}
										</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
						</View>
					</View>

					{/* Inventory */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Inventory</Text>
						<View style={styles.row}>
							<View style={[styles.formGroup, { flex: 1 }]}>
								<Text style={styles.label}>Current Stock</Text>
								<TextInput
									style={styles.input}
									placeholder="0"
									value={stock}
									onChangeText={setStock}
									keyboardType="numeric"
									placeholderTextColor={isHighContrast ? "#666" : "#9ca3af"}
								/>
							</View>
							<View style={[styles.formGroup, { flex: 1 }]}>
								<Text style={styles.label}>Restock Alert At</Text>
								<TextInput
									style={styles.input}
									placeholder="5"
									value={threshold}
									onChangeText={setThreshold}
									keyboardType="numeric"
									placeholderTextColor={isHighContrast ? "#666" : "#9ca3af"}
								/>
							</View>
						</View>
					</View>

					{/* Spacer for button */}
					<View style={{ height: 40 }} />
				</ScrollView>

				<View style={styles.footer}>
					<TouchableOpacity
						style={[
							styles.saveButton,
							addMutation.isPending && styles.disabled,
						]}
						onPress={handleSave}
						disabled={addMutation.isPending}
					>
						{addMutation.isPending ? (
							<ActivityIndicator color={isHighContrast ? "black" : "white"} />
						) : (
							<Text style={styles.saveText}>Save Medication</Text>
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
			backgroundColor: isHighContrast ? "#ffffff" : "white",
		},
		header: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingHorizontal: 16,
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: isHighContrast ? "#000000" : "#f3f4f6",
		},
		backButton: {
			padding: 8,
			width: 70,
		},
		backText: {
			color: isHighContrast ? "#000000" : "#6b7280",
			fontSize: 16 * textSize,
		},
		headerTitle: {
			fontSize: 18 * textSize,
			fontWeight: "bold",
			color: isHighContrast ? "#000000" : "#111827",
		},
		content: {
			padding: 24,
			gap: 24,
		},
		section: {
			gap: 16,
		},
		sectionTitle: {
			fontSize: 18 * textSize,
			fontWeight: "bold",
			color: isHighContrast ? "#000000" : "#1f2937",
			marginBottom: 8,
		},
		formGroup: {
			marginBottom: 8,
		},
		label: {
			fontSize: 14 * textSize,
			fontWeight: "600",
			color: isHighContrast ? "#000000" : "#374151",
			marginBottom: 8,
			textTransform: "uppercase",
			letterSpacing: 0.5,
		},
		input: {
			borderWidth: 1,
			borderColor: isHighContrast ? "#000000" : "#e5e7eb",
			borderRadius: 12,
			padding: 16,
			fontSize: 18 * textSize,
			color: isHighContrast ? "#000000" : "#111827",
			backgroundColor: isHighContrast ? "#ffffff" : "#f9fafb",
		},
		chipContainer: {
			flexDirection: "row",
			gap: 10,
			paddingRight: 20,
		},
		chip: {
			paddingHorizontal: 16,
			paddingVertical: 10,
			borderRadius: 20,
			borderWidth: isHighContrast ? 2 : 1,
			borderColor: isHighContrast ? "#000000" : "#e5e7eb",
			backgroundColor: isHighContrast ? "#ffffff" : "white",
			marginRight: 8,
		},
		chipSelected: {
			backgroundColor: isHighContrast ? "#ffcc00" : "#d1fae5",
			borderColor: isHighContrast ? "#000000" : "#10b981",
		},
		chipText: {
			fontSize: 14 * textSize,
			color: isHighContrast ? "#000000" : "#4b5563",
			fontWeight: "500",
		},
		chipTextSelected: {
			color: isHighContrast ? "#000000" : "#065f46",
			fontWeight: "bold",
		},
		timesList: {
			flexDirection: "row",
			flexWrap: "wrap",
			gap: 10,
		},
		timeBadge: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: isHighContrast ? "#e5e5e5" : "#f3f4f6",
			paddingHorizontal: 12,
			paddingVertical: 8,
			borderRadius: 20,
			borderWidth: isHighContrast ? 1 : 0,
			borderColor: "black",
			gap: 6,
		},
		timeText: {
			fontSize: 16 * textSize,
			color: isHighContrast ? "#000000" : "#1f2937",
			fontWeight: "600",
		},
		addTimeButton: {
			flexDirection: "row",
			alignItems: "center",
			paddingHorizontal: 12,
			paddingVertical: 8,
			// borderRadius: 20,
			// borderWidth: 1,
			// borderColor: "#2563eb",
			gap: 4,
		},
		addTimeText: {
			color: isHighContrast ? "#000000" : "#2563eb",
			fontWeight: "600",
			fontSize: 16 * textSize,
		},
		row: {
			flexDirection: "row",
			gap: 16,
		},
		footer: {
			padding: 24,
			borderTopWidth: 1,
			borderTopColor: isHighContrast ? "#000000" : "#f3f4f6",
			backgroundColor: isHighContrast ? "#ffffff" : "white",
		},
		saveButton: {
			backgroundColor: isHighContrast ? "#ffcc00" : "#10b981",
			borderRadius: 16,
			paddingVertical: 18,
			alignItems: "center",
			borderWidth: isHighContrast ? 2 : 0,
			borderColor: "black",
		},
		disabled: {
			opacity: 0.7,
		},
		saveText: {
			color: isHighContrast ? "black" : "white",
			fontSize: 18 * textSize,
			fontWeight: "bold",
		},
	});
