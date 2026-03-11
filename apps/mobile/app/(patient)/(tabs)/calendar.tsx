import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DailyLogList } from "@/components/calendar/DailyLogList";
import { WeekStrip } from "@/components/calendar/WeekStrip";
import { Colors } from "@/constants/theme";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useTRPC } from "@/lib/trpc";

// Simple date helpers
const formatDate = (date: Date) => date.toISOString().split("T")[0]; // YYYY-MM-DD
const isSameDay = (d1: Date, d2: Date) => formatDate(d1) === formatDate(d2);

export default function CalendarScreen() {
	const trpc = useTRPC();
	const { isHighContrast, isDarkMode, textSize } = useAccessibility();
	const styles = makeStyles(isHighContrast, isDarkMode, textSize);

	const [selectedDate, setSelectedDate] = useState(new Date());

	// Generate last 14 days + next 7 days for strip
	const dateStrip = useMemo(() => {
		const dates = [];
		const start = new Date();
		start.setDate(start.getDate() - 14); // 2 weeks back

		for (let i = 0; i < 21; i++) {
			const d = new Date(start);
			d.setDate(start.getDate() + i);
			dates.push(d);
		}
		return dates;
	}, []);

	// Fetch Log for Selected Date
	const dayLogQuery = useQuery(
		trpc.medication.getDayLog.queryOptions({ date: formatDate(selectedDate) }),
	);

	// Process Data into Timeline
	const timeline = useMemo(() => {
		if (!dayLogQuery.data) return [];

		const events: any[] = [];
		const now = new Date();
		const isToday = isSameDay(selectedDate, now);
		const isPast = selectedDate < now && !isToday;

		dayLogQuery.data.forEach((med) => {
			const intakes = med.intakeEvents || [];
			const schedules = med.doseSchedules || [];

			// 1. Map Schedules
			let takenCount = intakes.length;

			schedules.forEach((sched: any) => {
				const [h, m] = sched.timeOfDay.split(":").map(Number);

				// Determine Status
				let status = "UPCOMING";
				if (takenCount > 0) {
					status = "TAKEN";
					takenCount--;
				} else {
					if (isPast) {
						status = "MISSED";
					} else if (isToday) {
						const schedTime = new Date(selectedDate);
						schedTime.setHours(h, m, 0, 0);
						if (now > schedTime) {
							status = "MISSED"; // Or OVERDUE
						}
					}
				}

				events.push({
					id: `sched-${med.id}-${sched.timeOfDay}`,
					type: "SCHEDULE",
					time: sched.timeOfDay,
					medName: med.medication.nameBrand || med.medication.nameGeneric,
					dosage: med.dosageAmount,
					status,
					medId: med.id,
				});
			});
		});

		// Sort by Time
		events.sort((a, b) => {
			const [h1, m1] = a.time.split(":").map(Number);
			const [h2, m2] = b.time.split(":").map(Number);
			return h1 * 60 + m1 - (h2 * 60 + m2);
		});

		return events;
	}, [dayLogQuery.data, selectedDate]);

	const scrollToToday = () => {
		setSelectedDate(new Date());
	};

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.title}>History & Schedule</Text>
				{!isSameDay(selectedDate, new Date()) && (
					<TouchableOpacity onPress={scrollToToday}>
						<Text style={styles.todayBtn}>Jump to Today</Text>
					</TouchableOpacity>
				)}
			</View>

			{/* Date Strip */}
			<View>
				<WeekStrip
					dates={dateStrip}
					selectedDate={selectedDate}
					onSelectDate={setSelectedDate}
				/>
			</View>

			{/* Content List */}
			<ScrollView
				style={styles.content}
				refreshControl={
					<RefreshControl
						refreshing={dayLogQuery.isLoading}
						onRefresh={dayLogQuery.refetch}
					/>
				}
			>
				<View style={styles.dateHeader}>
					<Text style={styles.dateHeaderText}>
						{selectedDate.toLocaleDateString("en-US", {
							weekday: "long",
							month: "long",
							day: "numeric",
						})}
					</Text>
				</View>

				<DailyLogList isLoading={dayLogQuery.isLoading} logs={timeline} />

				<View style={{ height: 40 }} />
			</ScrollView>
		</SafeAreaView>
	);
}

const makeStyles = (
	isHighContrast: boolean,
	isDark: boolean,
	textSize: number,
) => {
	const theme = isHighContrast
		? Colors.highContrast
		: isDark
			? Colors.dark
			: Colors.light;
	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
		},
		header: {
			paddingHorizontal: 20,
			paddingVertical: 16,
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
		},
		title: {
			fontSize: 24 * textSize,
			fontWeight: "bold",
			color: theme.text,
		},
		todayBtn: {
			color: theme.primary,
			fontWeight: "600",
			fontSize: 14 * textSize,
		},
		content: {
			flex: 1,
			paddingHorizontal: 20,
		},
		dateHeader: {
			marginBottom: 20,
			paddingVertical: 8,
			borderBottomWidth: 1,
			borderBottomColor: theme.border,
		},
		dateHeaderText: {
			fontSize: 16 * textSize,
			fontWeight: "600",
			color: theme.textSecondary,
			textAlign: "center",
		},
	});
};
