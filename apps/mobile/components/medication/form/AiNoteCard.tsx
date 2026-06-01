import { Ionicons } from "@expo/vector-icons";
import {
	ActivityIndicator,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useLanguage } from "@/context/LanguageContext";
import { FIELD_LABEL } from "./LabeledInput";

interface AiNoteCardProps {
	isGenerating: boolean;
	error?: string | null;
	isGenerated: boolean;
	noteValue: string;
	canGenerate: boolean;
	onGenerate: () => void;
	onNoteChange: (text: string) => void;
}

export const AiNoteCard = ({
	isGenerating,
	error,
	isGenerated,
	noteValue,
	canGenerate,
	onGenerate,
	onNoteChange,
}: AiNoteCardProps) => {
	const { t } = useLanguage();

	return (
		<View className="gap-5 rounded-3xl border-violet-600 border-l-[3px] bg-surface-light p-5 shadow-sm dark:bg-surface-dark">
			<View className="flex-row items-center gap-3">
				<View className="h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950/40">
					<Ionicons
						name="sparkles"
						size={18}
						className="text-violet-600 dark:text-violet-400"
					/>
				</View>
				<View className="flex-1">
					<Text className="font-bold text-lg text-text-main-light dark:text-text-main-dark">
						{t("med.aiNote.title")}
					</Text>
					<Text className="mt-0.5 text-text-sub-light text-xs dark:text-text-sub-dark">
						{t("med.aiNote.subtitle")}
					</Text>
				</View>
			</View>

			<TouchableOpacity
				className={`flex-row items-center justify-center rounded-2xl bg-violet-100 px-5 py-3.5 dark:bg-violet-950/40 ${isGenerating || !canGenerate ? "opacity-50" : ""}`}
				onPress={onGenerate}
				disabled={isGenerating || !canGenerate}
			>
				{isGenerating ? (
					<>
						<ActivityIndicator size="small" color="#7c3aed" className="mr-2" />
						<Text className="font-bold text-sm text-violet-600 dark:text-violet-400">
							{t("med.aiNote.generating")}
						</Text>
					</>
				) : (
					<>
						<Ionicons
							name="sparkles"
							size={16}
							className="mr-1.5 text-violet-600 dark:text-violet-400"
						/>
						<Text className="font-bold text-sm text-violet-600 dark:text-violet-400">
							{isGenerated
								? t("med.aiNote.regenerate")
								: t("med.aiNote.generate")}
						</Text>
					</>
				)}
			</TouchableOpacity>

			{error ? (
				<View className="flex-row items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
					<Ionicons
						name="alert-circle-outline"
						size={16}
						className="text-red-600"
					/>
					<Text className="flex-1 font-medium text-[13px] text-red-600">
						{error}
					</Text>
				</View>
			) : null}

			<View className="gap-2">
				<Text className={FIELD_LABEL}>{t("med.aiNote.label")}</Text>
				<TextInput
					className={`min-h-[130px] rounded-2xl border bg-background-light p-4 text-[15px] text-text-main-light leading-6 dark:bg-background-dark dark:text-text-main-dark ${isGenerated ? "border-violet-300 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/20" : "border-border-light dark:border-border-dark"}`}
					value={noteValue}
					onChangeText={onNoteChange}
					placeholder={t("med.aiNote.placeholder")}
					placeholderTextColor="#9ca3af"
					multiline
					numberOfLines={5}
					textAlignVertical="top"
					editable={!isGenerating}
				/>
			</View>

			{isGenerated && (
				<View className="flex-row items-start gap-1.5 rounded-[10px] bg-background-light p-2.5 dark:bg-background-dark">
					<Ionicons
						name="information-circle-outline"
						size={14}
						className="text-text-sub-light dark:text-text-sub-dark"
					/>
					<Text className="flex-1 text-[11px] text-text-sub-light leading-4 dark:text-text-sub-dark">
						{t("med.aiNote.disclaimer")}
					</Text>
				</View>
			)}
		</View>
	);
};
