// import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { logger } from "@/lib/logger";
// import { Platform } from "react-native";

// Configure handler safely
/*
const configureNotifications = () => {
    ...
};
configureNotifications();
*/

export type ReceivedNotification = {
	request?: {
		content?: {
			data?: { medicationId?: string } | null;
			title?: string | null;
			body?: string | null;
		} | null;
	} | null;
};

export function useNotifications() {
	const [lastNotification, setLastNotification] =
		useState<ReceivedNotification | null>(null);

	useEffect(() => {
		// mock listener (notifications disabled in expo go sdk 53)
		// registerForLocalNotificationsAsync();

		return () => {
			// responseListener.remove();
			// notificationListener.remove();
		};
	}, []);

	async function scheduleMedicationReminder(
		title: string,
		body: string,
		hour: number,
		minute: number,
		data: Record<string, unknown> = {},
	) {
		logger.info("mock schedule", { title, body, hour, minute, data });
	}

	async function clearNotificationState() {
		setLastNotification(null);
		// await Notifications.cancelAllScheduledNotificationsAsync();
	}

	return {
		scheduleMedicationReminder,
		lastNotification,
		setLastNotification,
		clearNotificationState,
	};
}

/*
async function registerForLocalNotificationsAsync() {
    // ...
}
*/
