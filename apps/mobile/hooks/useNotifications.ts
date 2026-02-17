// import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
// import { Platform } from "react-native";

// Configure handler safely
/*
const configureNotifications = () => {
    ...
};
configureNotifications();
*/

export function useNotifications() {
	// const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);
	const [lastNotification, setLastNotification] = useState<unknown | null>(
		null,
	);

	useEffect(() => {
		// Mock listener
		console.log("Notifications disabled in Expo Go SDK 53");
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
		console.log("Mock schedule:", title, body, hour, minute, data);
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
