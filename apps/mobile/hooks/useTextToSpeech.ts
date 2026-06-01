/**
 * Hook for Text-to-Speech using expo-speech.
 * Reads assistant messages aloud for accessibility.
 */
import * as Speech from "expo-speech";
import { useCallback, useState } from "react";

export function useTextToSpeech(language: string) {
	const [speakingId, setSpeakingId] = useState<string | null>(null);

	const speak = useCallback(
		(text: string, messageId: string) => {
			Speech.stop();
			setSpeakingId((current) => {
				// Tapping the same message again toggles off.
				if (current === messageId) return null;

				Speech.speak(text, {
					language: language === "tr" ? "tr-TR" : "en-US",
					rate: 0.9,
					onDone: () => setSpeakingId(null),
					onStopped: () => setSpeakingId(null),
					onError: () => setSpeakingId(null),
				});
				return messageId;
			});
		},
		[language],
	);

	const stop = useCallback(() => {
		Speech.stop();
		setSpeakingId(null);
	}, []);

	return { speak, stop, speakingId };
}
