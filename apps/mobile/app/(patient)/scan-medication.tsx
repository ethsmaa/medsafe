import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTRPC } from "@/lib/trpc";

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
			<SafeAreaView className="flex-1 bg-black">
				<ActivityIndicator size="large" color="#d99696" />
			</SafeAreaView>
		);
	}

	// Permission denied
	if (!permission.granted) {
		return (
			<SafeAreaView className="flex-1 bg-black">
				<View className="flex-1 items-center justify-center gap-4 p-8">
					<Ionicons name="camera-outline" size={64} className="text-gray-400" />
					<Text className="font-bold text-2xl text-white">
						Kamera İzni Gerekli
					</Text>
					<Text className="text-center text-base text-gray-400">
						İlaç kutusunu taramak için kamera erişimine ihtiyacımız var.
					</Text>
					<TouchableOpacity
						className="mt-2 rounded-xl bg-primary px-8 py-3.5"
						onPress={requestPermission}
					>
						<Text className="font-bold text-base text-white">İzin Ver</Text>
					</TouchableOpacity>
					<TouchableOpacity className="mt-2" onPress={() => router.back()}>
						<Text className="text-gray-400 text-sm">Geri Dön</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<View className="flex-1 bg-black">
			<CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
				{/* Top Bar */}
				<SafeAreaView
					edges={["top"]}
					className="flex-row items-center justify-between px-4 pt-2"
				>
					<TouchableOpacity
						onPress={() => router.back()}
						className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
					>
						<Ionicons name="close" size={28} className="text-white" />
					</TouchableOpacity>
					<Text className="font-bold text-lg text-white">
						İlaç Kutusunu Tara
					</Text>
					<View className="w-10" />
				</SafeAreaView>

				{/* Center Frame */}
				<View className="flex-1 items-center justify-center">
					<View className="h-[200px] w-[300px] items-center justify-center rounded-2xl border-[3px] border-white/70 border-dashed">
						{scanMutation.isPending && (
							<View className="items-center gap-3">
								<ActivityIndicator size="large" color="white" />
								<Text className="font-semibold text-base text-white">
									Analiz ediliyor...
								</Text>
							</View>
						)}
					</View>
					<Text className="mt-4 text-center text-sm text-white/80">
						İlaç kutusunun ön yüzünü çerçeveye hizalayın
					</Text>
				</View>

				{/* Bottom Controls */}
				<SafeAreaView edges={["bottom"]} className="items-center pb-5">
					<TouchableOpacity
						className={`h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg ${isCaptured || scanMutation.isPending ? "opacity-60" : ""}`}
						onPress={handleCapture}
						disabled={isCaptured || scanMutation.isPending}
					>
						<View className="h-16 w-16 items-center justify-center rounded-full bg-[#f0f0f0]">
							{scanMutation.isPending ? (
								<ActivityIndicator size="small" color="#d99696" />
							) : (
								<Ionicons name="scan" size={32} className="text-primary" />
							)}
						</View>
					</TouchableOpacity>
				</SafeAreaView>
			</CameraView>
		</View>
	);
}
