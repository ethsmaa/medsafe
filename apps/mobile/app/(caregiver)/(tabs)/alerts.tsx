import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
	ActivityIndicator,
	FlatList,
	RefreshControl,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "@/context/LanguageContext";
import { useTRPC } from "@/lib/trpc";
import { useActivityLogStore } from "@/stores/activityLogStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type IntakeStatus = "TAKEN" | "SKIPPED" | "MISSED";

type LogEntry = {
	id: string;
	status: IntakeStatus;
	isOnTime: boolean;
	takenAt: Date | string;
	prescriptionMedication: {
		medication: { nameGeneric: string; nameBrand: string | null };
		patient: { user: { name: string } };
		doseSchedules: { timeOfDay: string }[];
	};
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date | string): string {
	const d = new Date(date);
	return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(
	date: Date | string,
	todayStr: string,
	yesterdayStr: string,
): string {
	const d = new Date(date);
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
	if (eventDay.getTime() === today.getTime()) return todayStr;
	if (eventDay.getTime() === yesterday.getTime()) return yesterdayStr;
	return d.toLocaleDateString([], {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

/**
 * Compute how many minutes early/late this event was vs. the nearest schedule.
 * Positive = late, Negative = early
 */
function computeTimingDelta(
	takenAt: Date | string,
	schedules: { timeOfDay: string }[],
): number | null {
	if (!schedules || schedules.length === 0) return null;
	const taken = new Date(takenAt);
	const takenMinutes = taken.getHours() * 60 + taken.getMinutes();
	const deltas = schedules.map((s) => {
		const parts = s.timeOfDay.split(":").map(Number);
		const scheduled = (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
		return takenMinutes - scheduled; // positive = late, negative = early
	});
	// Pick the closest scheduled time (minimum absolute delta)
	return deltas.reduce(
		(best, d) => (Math.abs(d) < Math.abs(best) ? d : best),
		deltas[0] ?? 0,
	);
}

function formatDelta(deltaMinutes: number | null, onTimeStr: string): string {
	if (deltaMinutes === null) return onTimeStr;
	const abs = Math.abs(deltaMinutes);
	if (abs <= 30) return onTimeStr;
	if (abs < 60) {
		const suffix = deltaMinutes > 0 ? "late" : "early";
		return `${abs} min ${suffix}`;
	}
	const hrs = Math.round(abs / 60);
	const suffix = deltaMinutes > 0 ? "late" : "early";
	return `${hrs} hr${hrs > 1 ? "s" : ""} ${suffix}`;
}

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
	IntakeStatus,
	{ icon: keyof typeof Ionicons.glyphMap; bgClass: string; tintClass: string }
> = {
	TAKEN: {
		icon: "checkmark-circle",
		bgClass: "bg-green-100 dark:bg-green-900/30",
		tintClass: "text-green-600 dark:text-green-400",
	},
	SKIPPED: {
		icon: "remove-circle",
		bgClass: "bg-yellow-100 dark:bg-yellow-900/30",
		tintClass: "text-yellow-600 dark:text-yellow-400",
	},
	MISSED: {
		icon: "close-circle",
		bgClass: "bg-red-100 dark:bg-red-900/30",
		tintClass: "text-red-600 dark:text-red-400",
	},
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ActivityLogScreen() {
	const { t } = useLanguage();
	const trpc = useTRPC();
	const { markAsSeen } = useActivityLogStore();

	const logQuery = useQuery(trpc.careTeam.getActivityLog.queryOptions());
	const entries = (logQuery.data ?? []) as LogEntry[];

	// Mark log as seen when this screen mounts / entries load
	useEffect(() => {
		const newestId = entries[0]?.id;
		if (newestId) {
			markAsSeen(newestId);
		}
	}, [entries, markAsSeen]);

	// Group entries by date label
	const grouped = entries.reduce<{ label: string; data: LogEntry[] }[]>(
		(acc, entry) => {
			const label = formatDateLabel(
				entry.takenAt,
				t("log.today"),
				t("log.yesterday"),
			);
			const last = acc[acc.length - 1];
			if (last && last.label === label) {
				last.data.push(entry);
			} else {
				acc.push({ label, data: [entry] });
			}
			return acc;
		},
		[],
	);

	const header = (
		<View className="px-5 pt-2 pb-4">
			<Text className="font-extrabold text-2xl text-text-main-light tracking-tight dark:text-text-main-dark">
				{t("log.title")}
			</Text>
			<Text className="mt-0.5 text-text-sub-light text-xs dark:text-text-sub-dark">
				{t("log.subtitle")}
			</Text>
		</View>
	);

	if (logQuery.isLoading) {
		return (
			<SafeAreaView
				className="flex-1 bg-background-light dark:bg-background-dark"
				edges={["top"]}
			>
				{header}
				<View className="flex-1 items-center justify-center pb-[60px]">
					<ActivityIndicator size="large" color="#d99696" />
				</View>
			</SafeAreaView>
		);
	}

	if (entries.length === 0) {
		return (
			<SafeAreaView
				className="flex-1 bg-background-light dark:bg-background-dark"
				edges={["top"]}
			>
				{header}
				<View className="flex-1 items-center justify-center pb-[60px]">
					<View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary-soft-light dark:bg-primary-soft-dark">
						<Ionicons name="time-outline" size={40} className="text-primary" />
					</View>
					<Text className="mb-1.5 font-bold text-lg text-text-main-light dark:text-text-main-dark">
						{t("log.empty")}
					</Text>
					<Text className="px-10 text-center text-sm text-text-sub-light leading-5 dark:text-text-sub-dark">
						{t("log.emptyDesc")}
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView
			className="flex-1 bg-background-light dark:bg-background-dark"
			edges={["top"]}
		>
			{header}

			<FlatList
				data={grouped}
				keyExtractor={(item) => item.label}
				contentContainerClassName="px-4 pb-8"
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={logQuery.isFetching}
						onRefresh={() => logQuery.refetch()}
						tintColor="#d99696"
					/>
				}
				renderItem={({ item: group }) => (
					<View className="mb-2">
						{/* Date separator */}
						<View className="my-3 flex-row items-center gap-2.5">
							<View className="h-px flex-1 bg-border-light dark:bg-border-dark" />
							<Text className="font-bold text-[11px] text-text-sub-light uppercase tracking-wider dark:text-text-sub-dark">
								{group.label}
							</Text>
							<View className="h-px flex-1 bg-border-light dark:bg-border-dark" />
						</View>

						{/* Log rows */}
						{group.data.map((entry) => {
							const medName =
								entry.prescriptionMedication.medication.nameBrand ||
								entry.prescriptionMedication.medication.nameGeneric;
							const patientName =
								entry.prescriptionMedication.patient.user.name ?? "—";
							const cfg = STATUS_CONFIG[entry.status];
							const statusText = t(
								entry.status === "TAKEN"
									? "log.statusTaken"
									: entry.status === "SKIPPED"
										? "log.statusSkipped"
										: "log.statusMissed",
							);

							// Compute timing delta
							const delta = computeTimingDelta(
								entry.takenAt,
								entry.prescriptionMedication.doseSchedules,
							);
							const timingLabel = formatDelta(delta, t("log.onTime"));
							const isOnTime = delta === null || Math.abs(delta) <= 30;

							return (
								<View
									key={entry.id}
									className="mb-2 flex-row items-center gap-3 rounded-2xl bg-surface-light p-3.5 shadow-sm dark:bg-surface-dark"
								>
									{/* Status icon */}
									<View
										className={`h-12 w-12 shrink-0 items-center justify-center rounded-full ${cfg.bgClass}`}
									>
										<Ionicons
											name={cfg.icon}
											size={24}
											className={cfg.tintClass}
										/>
									</View>

									{/* Content */}
									<View className="flex-1 gap-1">
										<Text
											className="text-sm text-text-main-light leading-5 dark:text-text-main-dark"
											numberOfLines={2}
										>
											<Text className="font-bold">{patientName}</Text>{" "}
											{statusText}{" "}
											<Text className="font-semibold">{medName}</Text>
										</Text>
										<View className="flex-row gap-1.5">
											<View
												className={`rounded-lg px-2 py-0.5 ${isOnTime ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
											>
												<Text
													className={`font-semibold text-[11px] ${isOnTime ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
												>
													{timingLabel}
												</Text>
											</View>
										</View>
									</View>

									{/* Time */}
									<Text className="shrink-0 font-medium text-text-sub-light text-xs dark:text-text-sub-dark">
										{formatTime(entry.takenAt)}
									</Text>
								</View>
							);
						})}
					</View>
				)}
			/>
		</SafeAreaView>
	);
}
