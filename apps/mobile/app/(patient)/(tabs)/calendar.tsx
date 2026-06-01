import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
	RefreshControl,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DailyLogList, type LogItem } from "@/components/calendar/DailyLogList";
import { WeekStrip } from "@/components/calendar/WeekStrip";
import { useTRPC } from "@/lib/trpc";

// Simple date helpers
const formatDate = (date: Date) => date.toISOString().split("T")[0]; // YYYY-MM-DD
const isSameDay = (d1: Date, d2: Date) => formatDate(d1) === formatDate(d2);

export default function CalendarScreen() {
	const trpc = useTRPC();

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

		const events: LogItem[] = [];
		const now = new Date();
		const isToday = isSameDay(selectedDate, now);
		const isPast = selectedDate < now && !isToday;

		dayLogQuery.data.forEach((med) => {
			const intakes = med.intakeEvents || [];
			const schedules = med.doseSchedules || [];

			// 1. Map Schedules
			let takenCount = intakes.length;

			schedules.forEach((sched) => {
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
		<SafeAreaView
			className="flex-1 bg-background-light dark:bg-background-dark"
			edges={["top"]}
		>
			{/* Header */}
			<View className="flex-row items-center justify-between px-5 py-4">
				<Text className="font-bold text-2xl text-text-main-light dark:text-text-main-dark">
					History & Schedule
				</Text>
				{!isSameDay(selectedDate, new Date()) && (
					<TouchableOpacity onPress={scrollToToday}>
						<Text className="font-semibold text-primary text-sm">
							Jump to Today
						</Text>
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
				className="flex-1 px-5"
				refreshControl={
					<RefreshControl
						refreshing={dayLogQuery.isLoading}
						onRefresh={dayLogQuery.refetch}
					/>
				}
			>
				<View className="mb-5 border-border-light border-b py-2 dark:border-border-dark">
					<Text className="text-center font-semibold text-base text-text-sub-light dark:text-text-sub-dark">
						{selectedDate.toLocaleDateString("en-US", {
							weekday: "long",
							month: "long",
							day: "numeric",
						})}
					</Text>
				</View>

				<DailyLogList isLoading={dayLogQuery.isLoading} logs={timeline} />

				<View className="h-10" />
			</ScrollView>
		</SafeAreaView>
	);
}
