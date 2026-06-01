import { router } from "expo-router";
import { useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authClient } from "@/lib/auth-client";
import { logger } from "@/lib/logger";
import { queryClient } from "@/lib/react-query";

export default function SignupScreen() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSignUp = async () => {
		if (!name || !email || !password) {
			Alert.alert("Error", "Please fill in all fields");
			return;
		}

		setLoading(true);
		try {
			const { error } = await authClient.signUp.email({
				email,
				password,
				name,
			});

			if (error) {
				Alert.alert("Sign Up Failed", error.message || "Unknown error");
			} else {
				const signInRes = await authClient.signIn.email({
					email,
					password,
				});
				const { error: signInError, data: signInData } = signInRes;

				if (signInError) {
					Alert.alert(
						"Sign Up Successful",
						"Please log in with your new account.",
					);
					router.replace("/(auth)/login");
				} else {
					// 1. Instantly update the user cache so hooks return true immediately
					queryClient.setQueryData(["user"], signInData.user);

					// 2. Invalidate to ensure consistency (background refetch)
					await queryClient.invalidateQueries({ queryKey: ["user"] });

					// 3. Manually navigate to the next screen
					// This prevents "nothing happens" while waiting for the reactive listener
					router.replace("/role-selection");
				}
			}
		} catch (e: unknown) {
			logger.error("Unexpected Error during Sign Up:", e);
			const errorMessage =
				e instanceof Error ? e.message : "An unexpected error occurred";
			Alert.alert("Critical Error", errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
			>
				<ScrollView
					contentContainerClassName="flex-grow justify-center px-8 pb-10"
					keyboardShouldPersistTaps="handled"
				>
					<View className="mt-5 mb-10 items-center">
						<View className="mb-6 flex-row justify-center">
							<View className="h-20 w-20 items-center justify-center rounded-full bg-primary/20">
								<Text style={{ fontSize: 40 }} className="text-primary">
									📝
								</Text>
							</View>
						</View>
						<Text className="mb-2 text-center font-bold text-4xl text-text-main-light dark:text-text-main-dark">
							Create Account
						</Text>
						<Text className="text-center text-lg text-text-sub-light dark:text-text-sub-dark">
							Join MedSafe today
						</Text>
					</View>

					<View className="gap-5">
						<View className="gap-2">
							<Text className="font-medium text-sm text-text-main-light dark:text-text-main-dark">
								Full Name
							</Text>
							<TextInput
								className="h-16 w-full rounded-xl border border-border-light bg-surface-light px-5 text-text-main-light text-xl shadow-sm focus:border-primary dark:border-border-dark dark:bg-surface-dark dark:text-text-main-dark"
								placeholder="John Doe"
								value={name}
								onChangeText={setName}
								autoCapitalize="words"
								autoCorrect={false}
								placeholderTextColor="#6b5e5e"
							/>
						</View>

						<View className="gap-2">
							<Text className="font-medium text-sm text-text-main-light dark:text-text-main-dark">
								Email
							</Text>
							<TextInput
								className="h-16 w-full rounded-xl border border-border-light bg-surface-light px-5 text-text-main-light text-xl shadow-sm focus:border-primary dark:border-border-dark dark:bg-surface-dark dark:text-text-main-dark"
								placeholder="your@email.com"
								value={email}
								onChangeText={setEmail}
								autoCapitalize="none"
								keyboardType="email-address"
								autoCorrect={false}
								placeholderTextColor="#6b5e5e"
							/>
						</View>

						<View className="gap-2">
							<Text className="font-medium text-sm text-text-main-light dark:text-text-main-dark">
								Password
							</Text>
							<TextInput
								className="h-16 w-full rounded-xl border border-border-light bg-surface-light px-5 text-text-main-light text-xl shadow-sm focus:border-primary dark:border-border-dark dark:bg-surface-dark dark:text-text-main-dark"
								placeholder="••••••••"
								value={password}
								onChangeText={setPassword}
								secureTextEntry
								placeholderTextColor="#6b5e5e"
							/>
						</View>

						<TouchableOpacity
							onPress={handleSignUp}
							disabled={loading}
							className={`mt-2 flex h-16 w-full items-center justify-center rounded-xl bg-primary shadow-md active:scale-[0.98] ${
								loading ? "opacity-70" : ""
							}`}
						>
							<Text className="font-bold text-[#161313] text-xl tracking-wide">
								{loading ? "Creating Account..." : "Sign Up"}
							</Text>
						</TouchableOpacity>

						<View className="mt-4 flex-row justify-center gap-2">
							<Text className="font-medium text-base text-text-sub-light dark:text-text-sub-dark">
								Already have an account?
							</Text>
							<TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
								<Text className="font-medium text-base text-text-sub-light underline decoration-current hover:text-primary dark:text-text-sub-dark">
									Sign In
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
