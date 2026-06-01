import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Animated, {
	cancelAnimation,
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { AssistantColors } from "@/constants/theme";

const BAR_COUNT = 5;

function WaveBar({ index, color }: { index: number; color: string }) {
	const height = useSharedValue(0.3);

	useEffect(() => {
		height.value = withRepeat(
			withSequence(
				withTiming(0.3, { duration: 100 * index }),
				withTiming(1, {
					duration: 300 + index * 50,
					easing: Easing.inOut(Easing.ease),
				}),
				withTiming(0.3, {
					duration: 300 + index * 50,
					easing: Easing.inOut(Easing.ease),
				}),
			),
			-1,
			true,
		);

		return () => cancelAnimation(height);
	}, [index, height]);

	const style = useAnimatedStyle(() => ({
		transform: [{ scaleY: height.value }],
	}));

	return (
		<Animated.View
			style={[
				{
					width: 4,
					height: 28,
					borderRadius: 2,
					backgroundColor: color,
				},
				style,
			]}
		/>
	);
}

type Props = {
	isDarkMode: boolean;
	textSize: number;
	transcript: string;
	label: string;
	isProcessing?: boolean;
};

export function ListeningIndicator({
	isDarkMode,
	textSize,
	transcript,
	label,
	isProcessing,
}: Props) {
	const ring1 = useSharedValue(1);
	const ring2 = useSharedValue(1);

	useEffect(() => {
		ring1.value = withRepeat(
			withSequence(
				withTiming(1.8, { duration: 1200, easing: Easing.out(Easing.ease) }),
				withTiming(1, { duration: 0 }),
			),
			-1,
			false,
		);
		ring2.value = withRepeat(
			withSequence(
				withTiming(1, { duration: 400 }),
				withTiming(1.8, { duration: 1200, easing: Easing.out(Easing.ease) }),
				withTiming(1, { duration: 0 }),
			),
			-1,
			false,
		);

		return () => {
			cancelAnimation(ring1);
			cancelAnimation(ring2);
		};
	}, [ring1, ring2]);

	const ringStyle1 = useAnimatedStyle(() => ({
		transform: [{ scale: ring1.value }],
		opacity: 2 - ring1.value,
	}));
	const ringStyle2 = useAnimatedStyle(() => ({
		transform: [{ scale: ring2.value }],
		opacity: 2 - ring2.value,
	}));

	return (
		<View className="flex-1 items-center justify-center">
			<View
				style={{
					width: 140,
					height: 140,
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Animated.View
					style={[
						{
							position: "absolute",
							width: 120,
							height: 120,
							borderRadius: 60,
							borderWidth: 2,
							borderColor: AssistantColors.ringHigh,
						},
						ringStyle1,
					]}
				/>
				<Animated.View
					style={[
						{
							position: "absolute",
							width: 100,
							height: 100,
							borderRadius: 50,
							borderWidth: 1.5,
							borderColor: AssistantColors.ringLow,
						},
						ringStyle2,
					]}
				/>
				<View
					style={{
						width: 72,
						height: 72,
						borderRadius: 36,
						backgroundColor: isDarkMode
							? AssistantColors.centerBg.dark
							: AssistantColors.centerBg.light,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					{isProcessing ? (
						<ActivityIndicator size="large" color={AssistantColors.accent} />
					) : (
						<Ionicons name="mic" size={32} color={AssistantColors.accent} />
					)}
				</View>
			</View>

			{!isProcessing && (
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: 4,
						marginTop: 16,
						height: 32,
					}}
				>
					{Array.from({ length: BAR_COUNT }, (_, i) => (
						<WaveBar
							key={`wave-${i}`}
							index={i}
							color={AssistantColors.waveColors[i]}
						/>
					))}
				</View>
			)}

			<Text
				className={`mt-4 font-semibold ${
					isDarkMode ? "text-neutral-200" : "text-neutral-700"
				}`}
				style={{ fontSize: 16 * textSize }}
			>
				{label}
			</Text>
			{transcript ? (
				<Text
					className={`mt-2 px-8 text-center italic ${
						isDarkMode ? "text-neutral-400" : "text-neutral-500"
					}`}
					style={{ fontSize: 13 * textSize }}
				>
					{transcript}
				</Text>
			) : null}
		</View>
	);
}
