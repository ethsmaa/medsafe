import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useEffect } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface ActiveAlertModalProps {
	visible: boolean;
	medicationName: string;
	dosage: string;
	onTake: () => void;
	onSnooze: () => void;
}

export function ActiveAlertModal({
	visible,
	medicationName,
	dosage,
	onTake,
	onSnooze,
}: ActiveAlertModalProps) {
	// Play Sound Loop
	useEffect(() => {
		let isLooping = true;

		async function startAlert() {
			if (!visible) return;

			// Speech Loop (Simulating Alarm Sound)
			const speakLoop = async () => {
				while (isLooping && visible) {
					Speech.speak(`Time to take ${medicationName}.`, {
						rate: 0.9,
						pitch: 1.0,
					});
					await new Promise((resolve) => setTimeout(resolve, 4000)); // Wait before repeat
				}
			};

			speakLoop();
		}

		if (visible) {
			startAlert();
		} else {
			isLooping = false;
			Speech.stop();
		}

		return () => {
			isLooping = false;
			Speech.stop();
		};
	}, [visible, medicationName]);

	if (!visible) return null;

	return (
		<Modal animationType="slide" transparent={false} visible={visible}>
			{/* Alarm theme stays fixed (red/urgent) regardless of light/dark. */}
			<View className="flex-1 items-center justify-center bg-red-100 p-6">
				<View className="mb-10 items-center gap-4">
					<Ionicons name="alarm" size={80} className="text-red-500" />
					<Text className="font-black text-3xl text-red-600 tracking-widest">
						MEDICATION TIME
					</Text>
				</View>

				<View className="mb-[60px] items-center">
					<Text className="mb-3 text-center font-bold text-4xl text-black">
						{medicationName}
					</Text>
					<Text className="mb-6 text-2xl text-gray-600">{dosage}</Text>
					<Text className="text-center text-gray-800 text-lg">
						It is time to take your medication.
					</Text>
				</View>

				<View className="w-full gap-5">
					<TouchableOpacity
						className="flex-row items-center justify-center gap-3 rounded-3xl bg-green-600 py-6 shadow-lg"
						onPress={onTake}
					>
						<Ionicons
							name="checkmark-circle"
							size={40}
							className="text-white"
						/>
						<Text className="font-bold text-3xl text-white">TAKE NOW</Text>
					</TouchableOpacity>

					<TouchableOpacity
						className="flex-row items-center justify-center gap-3 rounded-3xl border-2 border-gray-400 bg-gray-200 py-5"
						onPress={onSnooze}
					>
						<Ionicons name="time" size={30} className="text-black" />
						<Text className="font-semibold text-black text-xl">
							Snooze 10 Min
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}
