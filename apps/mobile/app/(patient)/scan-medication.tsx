import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTRPC } from "@/lib/trpc";
import { useMutation } from "@tanstack/react-query";

export default function ScanMedicationScreen() {
	const router = useRouter();
	const trpc = useTRPC();
	const cameraRef = useRef<CameraView>(null);
	const [permission, requestPermission] = useCameraPermissions();
	const [isCaptured, setIsCaptured] = useState(false);

	const scanMutation = useMutation({
		...trpc.medication.scanBox.mutationOptions(),
		onSuccess: (data) => {
			// Navigate to add-medication with scan results as params
			router.replace({
				pathname: "/(patient)/add-medication",
				params: {
					scanResult: JSON.stringify(data),
				},
			});
		},
		onError: (err) => {
			setIsCaptured(false);
			Alert.alert(
				"Tarama Başarısız",
				err.message ||
					"Fotoğraf okunamadı. Lütfen daha net bir fotoğraf çekin.",
			);
		},
	});

	const handleCapture = async () => {
		if (!cameraRef.current || isCaptured) return;
		setIsCaptured(true);

		try {
			const photo = await cameraRef.current.takePictureAsync({
				base64: true,
				quality: 0.7,
			});

			if (!photo?.base64) {
				setIsCaptured(false);
				Alert.alert("Hata", "Fotoğraf çekilemedi.");
				return;
			}

			scanMutation.mutate({ imageBase64: photo.base64 });
		} catch {
			setIsCaptured(false);
			Alert.alert("Hata", "Kamera hatası oluştu.");
		}
	};

	// Permission not yet determined
	if (!permission) {
		return (
			<SafeAreaView style={styles.container}>
				<ActivityIndicator size="large" color="#d99696" />
			</SafeAreaView>
		);
	}

	// Permission denied
	if (!permission.granted) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.permissionContainer}>
					<Ionicons name="camera-outline" size={64} color="#9ca3af" />
					<Text style={styles.permissionTitle}>Kamera İzni Gerekli</Text>
					<Text style={styles.permissionText}>
						İlaç kutusunu taramak için kamera erişimine ihtiyacımız var.
					</Text>
					<TouchableOpacity
						style={styles.permissionButton}
						onPress={requestPermission}
					>
						<Text style={styles.permissionButtonText}>İzin Ver</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.backLink}
						onPress={() => router.back()}
					>
						<Text style={styles.backLinkText}>Geri Dön</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<View style={styles.container}>
			<CameraView ref={cameraRef} style={styles.camera} facing="back">
				{/* Top Bar */}
				<SafeAreaView edges={["top"]} style={styles.topBar}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.closeButton}
					>
						<Ionicons name="close" size={28} color="white" />
					</TouchableOpacity>
					<Text style={styles.topTitle}>İlaç Kutusunu Tara</Text>
					<View style={{ width: 40 }} />
				</SafeAreaView>

				{/* Center Frame */}
				<View style={styles.frameContainer}>
					<View style={styles.frame}>
						{scanMutation.isPending && (
							<View style={styles.scanningOverlay}>
								<ActivityIndicator size="large" color="white" />
								<Text style={styles.scanningText}>Analiz ediliyor...</Text>
							</View>
						)}
					</View>
					<Text style={styles.hint}>
						İlaç kutusunun ön yüzünü çerçeveye hizalayın
					</Text>
				</View>

				{/* Bottom Controls */}
				<SafeAreaView edges={["bottom"]} style={styles.bottomBar}>
					<TouchableOpacity
						style={[
							styles.captureButton,
							(isCaptured || scanMutation.isPending) && styles.captureDisabled,
						]}
						onPress={handleCapture}
						disabled={isCaptured || scanMutation.isPending}
					>
						<View style={styles.captureInner}>
							{scanMutation.isPending ? (
								<ActivityIndicator size="small" color="#d99696" />
							) : (
								<Ionicons name="scan" size={32} color="#d99696" />
							)}
						</View>
					</TouchableOpacity>
				</SafeAreaView>
			</CameraView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	camera: {
		flex: 1,
	},
	topBar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingTop: 8,
	},
	closeButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "rgba(0,0,0,0.4)",
		alignItems: "center",
		justifyContent: "center",
	},
	topTitle: {
		color: "white",
		fontSize: 18,
		fontWeight: "700",
	},
	frameContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	frame: {
		width: 300,
		height: 200,
		borderRadius: 16,
		borderWidth: 3,
		borderColor: "rgba(255,255,255,0.7)",
		borderStyle: "dashed",
		alignItems: "center",
		justifyContent: "center",
	},
	scanningOverlay: {
		alignItems: "center",
		gap: 12,
	},
	scanningText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	hint: {
		color: "rgba(255,255,255,0.8)",
		fontSize: 14,
		marginTop: 16,
		textAlign: "center",
	},
	bottomBar: {
		alignItems: "center",
		paddingBottom: 20,
	},
	captureButton: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "white",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	captureDisabled: {
		opacity: 0.6,
	},
	captureInner: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: "#f0f0f0",
		alignItems: "center",
		justifyContent: "center",
	},
	permissionContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 32,
		gap: 16,
	},
	permissionTitle: {
		fontSize: 22,
		fontWeight: "700",
		color: "white",
	},
	permissionText: {
		fontSize: 16,
		color: "#9ca3af",
		textAlign: "center",
	},
	permissionButton: {
		backgroundColor: "#d99696",
		paddingHorizontal: 32,
		paddingVertical: 14,
		borderRadius: 12,
		marginTop: 8,
	},
	permissionButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "700",
	},
	backLink: {
		marginTop: 8,
	},
	backLinkText: {
		color: "#9ca3af",
		fontSize: 14,
	},
});
