import { Link } from "expo-router";
import { useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/react-query";

export default function LoginScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSignIn = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Please enter both email and password");
			return;
		}

		setLoading(true);
		try {
			const { error } = await authClient.signIn.email({
				email,
				password,
			});

			console.log(error);

			if (error) {
				Alert.alert("Sign In Failed", error.message);
			} else {
				await queryClient.invalidateQueries({ queryKey: ["user"] });
				// Role query will be refetched by _layout effect when user changes
			}
		} catch (e: unknown) {
			const errorMessage =
				e instanceof Error ? e.message : "An unexpected error occurred";
			Alert.alert("Error", errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1 justify-center px-6 py-8"
			>
				<View className="mb-10 items-center">
					<View className="mb-6 flex-row justify-center">
						<View className="h-20 w-20 items-center justify-center rounded-full bg-primary/20">
							<Text style={{ fontSize: 40 }} className="text-primary">
								💊
							</Text>
						</View>
					</View>
					<Text className="mb-3 text-center font-bold text-4xl text-text-main-light tracking-tight dark:text-text-main-dark">
						Welcome Back!
					</Text>
					<Text className="text-center font-normal text-lg text-text-sub-light dark:text-text-sub-dark">
						Please log in to manage your meds.
					</Text>
				</View>

				<View className="w-full max-w-[480px] gap-5 self-center">
					<View className="gap-2">
						<TextInput
							className="h-16 w-full rounded-xl border border-border-light bg-surface-light px-5 text-text-main-light text-xl shadow-sm focus:border-primary dark:border-border-dark dark:bg-surface-dark dark:text-text-main-dark"
							placeholder="Email"
							value={email}
							onChangeText={setEmail}
							autoCapitalize="none"
							keyboardType="email-address"
							autoCorrect={false}
							placeholderTextColor="#6b5e5e"
						/>
					</View>

					<View className="gap-2">
						<TextInput
							className="h-16 w-full rounded-xl border border-border-light bg-surface-light px-5 text-text-main-light text-xl shadow-sm focus:border-primary dark:border-border-dark dark:bg-surface-dark dark:text-text-main-dark"
							placeholder="Password"
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							placeholderTextColor="#6b5e5e"
						/>
					</View>

					<TouchableOpacity
						onPress={handleSignIn}
						disabled={loading}
						className={`flex h-16 w-full items-center justify-center rounded-xl bg-primary shadow-md active:scale-[0.98] ${
							loading ? "opacity-70" : ""
						}`}
					>
						<Text className="font-bold text-[#161313] text-xl tracking-wide">
							{loading ? "Signing in..." : "Log In"}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => {}}
						className="flex h-16 w-full flex-row items-center justify-center gap-3 rounded-xl border-2 border-primary/50 bg-transparent active:scale-[0.98]"
					>
						<Text className="font-semibold text-lg text-text-main-light dark:text-text-main-dark">
							Log in with FaceID
						</Text>
					</TouchableOpacity>

					<Link href="/(auth)/signup" asChild>
						<TouchableOpacity className="mt-4 flex-row justify-center gap-2">
							<Text className="font-medium text-base text-text-sub-light dark:text-text-sub-dark">
								Don't have an account?
							</Text>
							<Text className="font-medium text-base text-text-sub-light underline decoration-current hover:text-primary dark:text-text-sub-dark">
								Sign Up
							</Text>
						</TouchableOpacity>
					</Link>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
