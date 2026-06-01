const ESP32_HOST = process.env.ESP32_HOST;

type AlarmPayload = {
	medication: string;
	nextDoseMinutes: number;
};

async function esp32Fetch(path: string, init?: RequestInit) {
	if (!ESP32_HOST) {
		throw new Error("ESP32_HOST not configured");
	}
	const url = `http://${ESP32_HOST}${path}`;
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 4000);
	try {
		const res = await fetch(url, { ...init, signal: controller.signal });
		if (!res.ok) {
			throw new Error(`ESP32 ${path} -> HTTP ${res.status}`);
		}
		return res.json();
	} finally {
		clearTimeout(timer);
	}
}

export async function fireAlarm(payload: AlarmPayload) {
	return esp32Fetch("/alarm", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
}

export async function updateInfo(payload: AlarmPayload) {
	return esp32Fetch("/info", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
}

export async function stopAlarm() {
	return esp32Fetch("/stop", { method: "POST" });
}

export async function getStatus() {
	return esp32Fetch("/status");
}
