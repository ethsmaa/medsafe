import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface AddMedicationMenuProps {
	visible: boolean;
	title: string;
	manualLabel: string;
	scanLabel: string;
	cancelLabel: string;
	onManual: () => void;
	onScan: () => void;
	onClose: () => void;
}

const OPTION_ROW =
	"mb-3 flex-row items-center gap-4 rounded-2xl border border-border-light bg-background-light p-4 dark:border-border-dark dark:bg-background-dark";
const OPTION_ICON =
	"h-12 w-12 items-center justify-center rounded-full bg-primary-soft-light dark:bg-primary-soft-dark";
const OPTION_TEXT =
	"flex-1 font-semibold text-base text-text-main-light dark:text-text-main-dark";

/**
 * On-brand bottom sheet for choosing how to add a medication. Replaces a native
 * Alert with emoji-labelled options: large touch targets and real icons make it
 * clearer for elderly users and accessible to screen readers.
 */
export function AddMedicationMenu({
	visible,
	title,
	manualLabel,
	scanLabel,
	cancelLabel,
	onManual,
	onScan,
	onClose,
}: AddMedicationMenuProps) {
	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<Pressable
				className="flex-1 justify-end bg-black/50"
				onPress={onClose}
				accessibilityRole="button"
				accessibilityLabel={cancelLabel}
			>
				<Pressable
					className="rounded-t-3xl bg-surface-light p-5 pb-8 dark:bg-surface-dark"
					onPress={(e) => e.stopPropagation()}
				>
					<Text
						accessibilityRole="header"
						className="mb-4 text-center font-bold text-lg text-text-main-light dark:text-text-main-dark"
					>
						{title}
					</Text>

					<TouchableOpacity
						onPress={onManual}
						accessibilityRole="button"
						accessibilityLabel={manualLabel}
						className={OPTION_ROW}
					>
						<View className={OPTION_ICON}>
							<Ionicons
								name="create-outline"
								size={24}
								className="text-primary"
							/>
						</View>
						<Text className={OPTION_TEXT}>{manualLabel}</Text>
						<Ionicons
							name="chevron-forward"
							size={20}
							className="text-text-sub-light dark:text-text-sub-dark"
						/>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={onScan}
						accessibilityRole="button"
						accessibilityLabel={scanLabel}
						className={OPTION_ROW}
					>
						<View className={OPTION_ICON}>
							<Ionicons
								name="camera-outline"
								size={24}
								className="text-primary"
							/>
						</View>
						<Text className={OPTION_TEXT}>{scanLabel}</Text>
						<Ionicons
							name="chevron-forward"
							size={20}
							className="text-text-sub-light dark:text-text-sub-dark"
						/>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={onClose}
						accessibilityRole="button"
						accessibilityLabel={cancelLabel}
						className="mt-1 items-center rounded-2xl py-3"
					>
						<Text className="font-semibold text-base text-text-sub-light dark:text-text-sub-dark">
							{cancelLabel}
						</Text>
					</TouchableOpacity>
				</Pressable>
			</Pressable>
		</Modal>
	);
}
