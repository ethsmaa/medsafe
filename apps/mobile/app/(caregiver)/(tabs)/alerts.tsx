import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
	ActivityIndicator,
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAccessibility } from "@/context/AccessibilityContext";
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
	{ icon: keyof typeof Ionicons.glyphMap; bg: string; tint: string }
> = {
	TAKEN: { icon: "checkmark-circle", bg: "#dcfce7", tint: "#16a34a" },
	SKIPPED: { icon: "remove-circle", bg: "#fef9c3", tint: "#ca8a04" },
	MISSED: { icon: "close-circle", bg: "#fee2e2", tint: "#dc2626" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ActivityLogScreen() {
	const { isHighContrast, textSize } = useAccessibility();
	const { t } = useLanguage();
	const trpc = useTRPC();
	const styles = makeStyles(isHighContrast, textSize);
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

	if (logQuery.isLoading) {
		return (
			<SafeAreaView style={styles.container} edges={["top"]}>
				<View style={styles.header}>
					<Text style={styles.title}>{t("log.title")}</Text>
					<Text style={styles.subtitle}>{t("log.subtitle")}</Text>
				</View>
				<View style={styles.centered}>
					<ActivityIndicator size="large" color="#d99696" />
				</View>
			</SafeAreaView>
		);
	}

	if (entries.length === 0) {
		return (
			<SafeAreaView style={styles.container} edges={["top"]}>
				<View style={styles.header}>
					<Text style={styles.title}>{t("log.title")}</Text>
					<Text style={styles.subtitle}>{t("log.subtitle")}</Text>
				</View>
				<View style={styles.centered}>
					<View style={styles.emptyIconCircle}>
						<Ionicons name="time-outline" size={40} color="#d99696" />
					</View>
					<Text style={styles.emptyText}>{t("log.empty")}</Text>
					<Text style={styles.emptyDesc}>{t("log.emptyDesc")}</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<View style={styles.header}>
				<Text style={styles.title}>{t("log.title")}</Text>
				<Text style={styles.subtitle}>{t("log.subtitle")}</Text>
			</View>

			<FlatList
				data={grouped}
				keyExtractor={(item) => item.label}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={logQuery.isFetching}
						onRefresh={() => logQuery.refetch()}
						tintColor="#d99696"
					/>
				}
				renderItem={({ item: group }) => (
					<View style={styles.group}>
						{/* Date separator */}
						<View style={styles.dateSeparator}>
							<View style={styles.dateLine} />
							<Text style={styles.dateLabel}>{group.label}</Text>
							<View style={styles.dateLine} />
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
								<View key={entry.id} style={styles.logCard}>
									{/* Status icon */}
									<View
										style={[styles.iconCircle, { backgroundColor: cfg.bg }]}
									>
										<Ionicons name={cfg.icon} size={24} color={cfg.tint} />
									</View>

									{/* Content */}
									<View style={styles.logBody}>
										<Text style={styles.logTitle} numberOfLines={2}>
											<Text style={styles.logPatient}>{patientName}</Text>{" "}
											{statusText} <Text style={styles.logMed}>{medName}</Text>
										</Text>
										<View style={styles.logMeta}>
											<View
												style={[
													styles.timingBadge,
													{
														backgroundColor: isOnTime ? "#dcfce7" : "#fee2e2",
													},
												]}
											>
												<Text
													style={[
														styles.timingText,
														{
															color: isOnTime ? "#16a34a" : "#dc2626",
														},
													]}
												>
													{timingLabel}
												</Text>
											</View>
										</View>
									</View>

									{/* Time */}
									<Text style={styles.logTime}>
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (isHighContrast: boolean, textSize: number) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: isHighContrast ? "#ffffff" : "#f3f4f6",
		},
		header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
		title: {
			fontSize: 26 * textSize,
			fontWeight: "800",
			color: isHighContrast ? "#000000" : "#111827",
			letterSpacing: -0.5,
		},
		subtitle: {
			fontSize: 13 * textSize,
			color: isHighContrast ? "#000000" : "#6b7280",
			marginTop: 2,
		},
		centered: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			paddingBottom: 60,
		},
		emptyIconCircle: {
			width: 80,
			height: 80,
			borderRadius: 40,
			backgroundColor: "#fde8e8",
			alignItems: "center",
			justifyContent: "center",
			marginBottom: 16,
		},
		emptyText: {
			fontSize: 18 * textSize,
			fontWeight: "700",
			color: isHighContrast ? "#000" : "#374151",
			marginBottom: 6,
		},
		emptyDesc: {
			fontSize: 14 * textSize,
			color: isHighContrast ? "#000" : "#6b7280",
			textAlign: "center",
			paddingHorizontal: 40,
			lineHeight: 20,
		},
		listContent: { paddingHorizontal: 16, paddingBottom: 32 },
		group: { marginBottom: 8 },
		dateSeparator: {
			flexDirection: "row",
			alignItems: "center",
			marginVertical: 12,
			gap: 10,
		},
		dateLine: {
			flex: 1,
			height: 1,
			backgroundColor: isHighContrast ? "#000" : "#e5e7eb",
		},
		dateLabel: {
			fontSize: 11 * textSize,
			fontWeight: "700",
			color: isHighContrast ? "#000" : "#9ca3af",
			textTransform: "uppercase",
			letterSpacing: 0.8,
		},
		logCard: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: isHighContrast ? "#ffffff" : "white",
			borderRadius: 16,
			padding: 14,
			marginBottom: 8,
			gap: 12,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.05,
			shadowRadius: 4,
			elevation: 1,
			borderWidth: isHighContrast ? 1 : 0,
			borderColor: "#000",
		},
		iconCircle: {
			width: 48,
			height: 48,
			borderRadius: 24,
			alignItems: "center",
			justifyContent: "center",
			flexShrink: 0,
		},
		logBody: { flex: 1, gap: 4 },
		logTitle: {
			fontSize: 14 * textSize,
			color: isHighContrast ? "#000" : "#111827",
			lineHeight: 20,
		},
		logPatient: { fontWeight: "700" },
		logMed: { fontWeight: "600", color: isHighContrast ? "#000" : "#374151" },
		logMeta: { flexDirection: "row", gap: 6 },
		timingBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
		timingText: { fontSize: 11 * textSize, fontWeight: "600" },
		logTime: {
			fontSize: 12 * textSize,
			color: isHighContrast ? "#000" : "#9ca3af",
			fontWeight: "500",
			flexShrink: 0,
		},
	});
