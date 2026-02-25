import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTRPC } from "@/lib/trpc";
import { suggestTimes, DOSE_COUNT_OPTIONS } from "@/constants/time-suggestions";
import { useNotifications } from "@/hooks/useNotifications";
import { useLanguage } from "@/context/LanguageContext";
import {
	MEDICATION_FORMS as FORMS,
	MEDICATION_FREQUENCIES as FREQUENCIES,
	MEAL_STATUSES,
} from "@/constants/medication";

export { DOSE_COUNT_OPTIONS } from "@/constants/time-suggestions";
export { MEDICATION_FORMS as FORMS, MEDICATION_FREQUENCIES as FREQUENCIES, MEAL_STATUSES } from "@/constants/medication";

export function useMedicationForm() {
	const router = useRouter();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { t } = useLanguage();
	const { scheduleMedicationReminder } = useNotifications();

	const { id, scanResult } = useLocalSearchParams<{
		id: string;
		scanResult: string;
	}>();
	const isEditing = !!id;

	// Fetch existing med for editing
	const cabinetQuery = useQuery(trpc.medication.getMyCabinet.queryOptions({}));
	const existingMed = cabinetQuery.data?.find((m) => m.id === id);

	// Form state
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

	// Time picker state
	const [showTimePicker, setShowTimePicker] = useState(false);
	const [tempDate, setTempDate] = useState(new Date());

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
				const meal = scan.mealStatus ?? "ANY";
				setTimes(suggestTimes(count, meal));
			} catch {
				// Invalid scan result, ignore
			}
		}
	}, [scanResult, isEditing]);

	// Pre-fill from existing medication (editing)
	useEffect(() => {
		if (isEditing && existingMed) {
			setName(existingMed.medication.nameGeneric || "");
			setBrandName(existingMed.medication.nameBrand || "");
			setDosage(existingMed.dosageAmount);
			setStock(existingMed.currentStock.toString());
			setThreshold(existingMed.restockThreshold.toString());
			setSelectedFreq(existingMed.frequency as (typeof FREQUENCIES)[number]);
			setSelectedForm(existingMed.form as (typeof FORMS)[number]);
			setSelectedMeal(existingMed.mealStatus as (typeof MEAL_STATUSES)[number]);

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

	// Mutations
	const addMutation = useMutation({
		...trpc.medication.addMedicationManual.mutationOptions(),
		onSuccess: (data, variables) => {
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
				nameGeneric: name,
				nameBrand: brandName,
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

	const onTimeChange = (event: { type: string }, selectedDate?: Date) => {
		if (Platform.OS === "android") {
			setShowTimePicker(false);
			if (event.type === "set" && selectedDate) {
				setTimes([...times, selectedDate]);
			}
		} else {
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

	// Auto-suggest times based on dose count (if not manually edited)
	useEffect(() => {
		if (!timesManuallyEdited && !isEditing) {
			setTimes(suggestTimes(doseCount, selectedMeal));
		}
	}, [doseCount, selectedMeal, timesManuallyEdited, isEditing]);

	return {
		// Route state
		router,
		isEditing,
		// Form values
		name, setName,
		brandName, setBrandName,
		dosage, setDosage,
		stock, setStock,
		threshold, setThreshold,
		doseCount, setDoseCount,
		selectedFreq, setSelectedFreq,
		selectedForm, setSelectedForm,
		selectedMeal, setSelectedMeal,
		times,
		// Time picker
		showTimePicker, setShowTimePicker,
		tempDate,
		onTimeChange,
		addTime,
		confirmTime,
		removeTime,
		// Actions
		handleSave,
		isSaving: addMutation.isPending || updateMutation.isPending,
	};
}
