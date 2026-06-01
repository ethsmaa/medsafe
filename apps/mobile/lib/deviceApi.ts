import Constants from "expo-constants";

const getBaseURL = () => {
	if (__DEV__) {
		const debuggerHost =
			Constants.expoConfig?.hostUri ??
			Constants.manifest2?.extra?.expoGo?.debuggerHost;
		const hostname = debuggerHost?.split(":")[0] ?? "localhost";
		return `http://${hostname}:3001`;
	}
	return "https://api.medsafe.app";
};

type AlarmPayload = {
	medication: string;
	nextDoseMinutes: number;
};

export async function fireDeviceAlarm(payload: AlarmPayload) {
	const res = await fetch(`${getBaseURL()}/api/device/alarm`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`alarm failed: ${res.status} ${text}`);
	}
	return res.json();
}

export async function updateDeviceInfo(payload: AlarmPayload) {
	const res = await fetch(`${getBaseURL()}/api/device/info`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`info failed: ${res.status} ${text}`);
	}
	return res.json();
}

export async function stopDeviceAlarm() {
	const res = await fetch(`${getBaseURL()}/api/device/stop`, {
		method: "POST",
	});
	if (!res.ok) throw new Error(`stop failed: ${res.status}`);
	return res.json();
}

export async function getDeviceStatus() {
	const res = await fetch(`${getBaseURL()}/api/device/status`);
	if (!res.ok) throw new Error(`status failed: ${res.status}`);
	return res.json() as Promise<{
		active: boolean;
		medication: string;
		ip: string;
	}>;
}
