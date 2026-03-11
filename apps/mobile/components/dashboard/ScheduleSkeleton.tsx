import { View, Animated } from "react-native";
import { useEffect, useRef } from "react";

export function ScheduleSkeleton() {
	const opacity = useRef(new Animated.Value(0.3)).current;

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, {
					toValue: 0.7,
					duration: 800,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 0.3,
					duration: 800,
					useNativeDriver: true,
				}),
			]),
		).start();
	}, [opacity]);

	return (
		<View className="gap-y-4">
			{[1, 2, 3].map((i) => (
				<View key={i} className="flex-row">
					{/* Left: Timeline Circle */}
					<View className="mr-4 w-16 items-center">
						<Animated.View
							style={{ opacity }}
							className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"
						/>
					</View>
					{/* Right: Card */}
					<View className="flex-1">
						<Animated.View
							style={{ opacity }}
							className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 p-5"
						>
							<View className="mb-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
							<View className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
						</Animated.View>
					</View>
				</View>
			))}
		</View>
	);
}
