import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTRPC } from "@/lib/trpc";

export type AiNoteState = {
	/** The generated (or manually edited) note text */
	aiNote: string;
	/** True while the mutation is in flight */
	isGenerating: boolean;
	/** Error message from the last failed attempt, or null */
	aiError: string | null;
	/** True once a note has been successfully generated at least once */
	isAiGenerated: boolean;
	/** Call this to kick off note generation for the given drug name */
	generateNote: (drugName: string) => void;
	/** Allow the user to directly edit the note after generation */
	setAiNote: (note: string) => void;
	/** Resets all state (e.g. when the drug name changes) */
	clearNote: () => void;
};

/**
 * Manages the AI-powered medication note lifecycle:
 *   1. Calls the backend `medication.generateNote` tRPC mutation
 *   2. Stores and exposes the resulting note for display/editing
 *   3. Provides loading, error, and isAiGenerated flags for the UI
 */
export function useAiNote(): AiNoteState {
	const trpc = useTRPC();
	const { locale } = useLanguage();

	const [aiNote, setAiNote] = useState("");
	const [aiError, setAiError] = useState<string | null>(null);
	const [isAiGenerated, setIsAiGenerated] = useState(false);

	const mutation = useMutation({
		...trpc.medication.generateNote.mutationOptions(),
		onSuccess: (data) => {
			setAiNote(data.note);
			setIsAiGenerated(true);
			setAiError(null);
		},
		onError: (err) => {
			setAiError(err.message ?? "An error occurred. Please try again.");
		},
	});

	const generateNote = (drugName: string) => {
		const trimmed = drugName.trim();
		if (!trimmed) {
			setAiError("Please enter a brand name or generic name first.");
			return;
		}
		setAiError(null);
		mutation.mutate({ drugName: trimmed, language: locale });
	};

	const clearNote = () => {
		setAiNote("");
		setAiError(null);
		setIsAiGenerated(false);
	};

	return {
		aiNote,
		isGenerating: mutation.isPending,
		aiError,
		isAiGenerated,
		generateNote,
		setAiNote,
		clearNote,
	};
}
