import { authClient } from "@/lib/auth-client";
import { router } from "expo-router";
import { useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
				// handled by router/auth state listener
				router.push({ pathname: "/(tabs)" });
			}
		} catch (e: any) {
			Alert.alert("Error", e.message || "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.keyboardView}
			>
				<View style={styles.header}>
					<Text style={styles.title}>Welcome Back</Text>
					<Text style={styles.subtitle}>Sign in to continue</Text>
				</View>

				<View style={styles.form}>
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Email</Text>
						<TextInput
							style={styles.input}
							placeholder="your@email.com"
							value={email}
							onChangeText={setEmail}
							autoCapitalize="none"
							keyboardType="email-address"
							autoCorrect={false}
							placeholderTextColor="#9ca3af"
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Password</Text>
						<TextInput
							style={styles.input}
							placeholder="••••••••"
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							placeholderTextColor="#9ca3af"
						/>
					</View>

					<TouchableOpacity
						onPress={handleSignIn}
						disabled={loading}
						style={[styles.button, loading && styles.buttonDisabled]}
					>
						<Text style={styles.buttonText}>
							{loading ? "Signing in..." : "Sign In"}
						</Text>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
	},
	keyboardView: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 32,
	},
	header: {
		marginBottom: 48,
	},
	title: {
		marginBottom: 8,
		fontSize: 36,
		fontWeight: "bold",
		color: "black",
	},
	subtitle: {
		fontSize: 16,
		color: "#6b7280",
	},
	form: {
		gap: 24,
	},
	inputGroup: {},
	label: {
		marginBottom: 8,
		fontSize: 14,
		fontWeight: "500",
		color: "#374151",
	},
	input: {
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#e5e7eb",
		backgroundColor: "#f9fafb",
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		color: "black",
	},
	button: {
		marginTop: 16,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 12,
		backgroundColor: "#2563eb",
		paddingVertical: 16,
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	buttonText: {
		fontWeight: "600",
		color: "white",
		fontSize: 18,
	},
});
