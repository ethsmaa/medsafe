/**
 * Activity Log unread tracking store.
 * Tracks the newest log entry ID seen by the caregiver.
 * - Badge disappears when alerts tab is visited (markAsSeen called)
 * - Badge reappears when new entries arrive that are newer than last-seen
 * - Home dashboard can read unreadCount to show "N Pending Alerts"
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "activity_log_last_seen_id";

// Module-level shared state — all hook instances share same memory
let listeners: Array<() => void> = [];
let lastSeenId: string | null = null;
let lastSeenLoaded = false;

function notify() {
	for (const fn of listeners) fn();
}

async function loadPersistedLastSeen() {
	if (lastSeenLoaded) return;
	lastSeenLoaded = true;
	try {
		const val = await AsyncStorage.getItem(STORAGE_KEY);
		if (val) {
			lastSeenId = val;
			notify();
		}
	} catch {}
}

export function useActivityLogStore() {
	const [, forceRender] = useState(0);

	useEffect(() => {
		loadPersistedLastSeen();
		const fn = () => forceRender((n) => n + 1);
		listeners.push(fn);
		return () => {
			listeners = listeners.filter((l) => l !== fn);
		};
	}, []);

	/** Call when the activity log screen is focused — clears the badge */
	const markAsSeen = useCallback((newestId: string) => {
		if (lastSeenId === newestId) return;
		lastSeenId = newestId;
		AsyncStorage.setItem(STORAGE_KEY, newestId).catch(() => {});
		notify();
	}, []);

	/**
	 * Returns number of entries the caregiver hasn't seen yet.
	 * @param entries - all fetched log entries (ordered newest first)
	 */
	const getUnreadCount = useCallback(
		(entries: Array<{ id: string }>): number => {
			if (!entries || entries.length === 0) return 0;
			if (!lastSeenId) return entries.length; // Never visited — all are new
			const idx = entries.findIndex((e) => e.id === lastSeenId);
			return idx === -1 ? entries.length : idx; // entries before lastSeenId are newer
		},
		[],
	);

	return { markAsSeen, getUnreadCount };
}
