import { Audio } from "expo-av";
import { File } from "expo-file-system";
import { useCallback, useRef, useState } from "react";

const MIN_DURATION_MS = 800;
const MAX_DURATION_MS = 60_000;

const RECORDING_OPTIONS: Audio.RecordingOptions = {
	isMeteringEnabled: false,
	android: {
		extension: ".m4a",
		outputFormat: Audio.AndroidOutputFormat.MPEG_4,
		audioEncoder: Audio.AndroidAudioEncoder.AAC,
		sampleRate: 44100,
		numberOfChannels: 1,
		bitRate: 64000,
	},
	ios: {
		extension: ".m4a",
		outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
		audioQuality: Audio.IOSAudioQuality.HIGH,
		sampleRate: 44100,
		numberOfChannels: 1,
		bitRate: 64000,
		linearPCMBitDepth: 16,
		linearPCMIsBigEndian: false,
		linearPCMIsFloat: false,
	},
	web: {
		mimeType: "audio/webm",
		bitsPerSecond: 64000,
	},
};

export type StopResult =
	| { kind: "ok"; audioBase64: string; durationMs: number }
	| { kind: "too_short"; durationMs: number }
	| { kind: "error" };

export type StartResult = {
	error: null | "permission_denied" | "start_failed";
};

export function useVoiceRecorder(options?: { onMaxDuration?: () => void }) {
	const [isRecording, setIsRecording] = useState(false);
	const recordingRef = useRef<Audio.Recording | null>(null);
	const startedAtRef = useRef<number | null>(null);
	const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const onMaxDurationRef = useRef(options?.onMaxDuration);
	onMaxDurationRef.current = options?.onMaxDuration;

	const clearMaxTimer = () => {
		if (maxTimerRef.current) {
			clearTimeout(maxTimerRef.current);
			maxTimerRef.current = null;
		}
	};

	const startRecording = useCallback(async (): Promise<StartResult> => {
		try {
			const permission = await Audio.requestPermissionsAsync();
			if (!permission.granted) {
				return { error: "permission_denied" };
			}

			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
			});

			const { recording } =
				await Audio.Recording.createAsync(RECORDING_OPTIONS);

			recordingRef.current = recording;
			startedAtRef.current = Date.now();
			setIsRecording(true);

			clearMaxTimer();
			maxTimerRef.current = setTimeout(() => {
				onMaxDurationRef.current?.();
			}, MAX_DURATION_MS);

			return { error: null };
		} catch {
			return { error: "start_failed" };
		}
	}, []);

	const stopRecording = useCallback(async (): Promise<StopResult> => {
		clearMaxTimer();
		const recording = recordingRef.current;
		recordingRef.current = null;
		const startedAt = startedAtRef.current;
		startedAtRef.current = null;
		setIsRecording(false);

		if (!recording) return { kind: "error" };

		const durationMs = startedAt ? Date.now() - startedAt : 0;

		let uri: string | null = null;
		try {
			await recording.stopAndUnloadAsync();
			await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
			uri = recording.getURI();
		} catch {
			return { kind: "error" };
		}

		if (!uri) return { kind: "error" };

		if (durationMs < MIN_DURATION_MS) {
			try {
				new File(uri).delete();
			} catch {}
			return { kind: "too_short", durationMs };
		}

		const file = new File(uri);
		try {
			const audioBase64 = await file.base64();
			return { kind: "ok", audioBase64, durationMs };
		} catch {
			return { kind: "error" };
		} finally {
			try {
				file.delete();
			} catch {}
		}
	}, []);

	const cancelRecording = useCallback(async () => {
		clearMaxTimer();
		const recording = recordingRef.current;
		recordingRef.current = null;
		startedAtRef.current = null;
		setIsRecording(false);

		if (!recording) return;

		try {
			await recording.stopAndUnloadAsync();
			await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
			const uri = recording.getURI();
			if (uri) {
				try {
					new File(uri).delete();
				} catch {}
			}
		} catch {}
	}, []);

	return {
		isRecording,
		startRecording,
		stopRecording,
		cancelRecording,
	};
}
