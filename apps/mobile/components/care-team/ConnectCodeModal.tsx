import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Modal,
	Share,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useTRPC } from "@/lib/trpc";

interface ConnectCodeModalProps {
	visible: boolean;
	onClose: () => void;
	/** Called after a successful connection so the parent can refetch. */
	onConnected?: () => void;
}

export function ConnectCodeModal({
	visible,
	onClose,
	onConnected,
}: ConnectCodeModalProps) {
	const trpc = useTRPC();
	const [entered, setEntered] = useState("");
	const [scanning, setScanning] = useState(false);
	const [permission, requestPermission] = useCameraPermissions();
	// One-shot guard: onBarcodeScanned fires on every camera frame, so without
	// this the same code would be submitted dozens of times before isPending flips.
	const scannedRef = useRef(false);

	const codeQuery = useQuery({
		...trpc.careTeam.getMyConnectCode.queryOptions(),
		enabled: visible,
	});

	const connectMutation = useMutation({
		...trpc.careTeam.connectWithCode.mutationOptions(),
		onSuccess: () => {
			setEntered("");
			setScanning(false);
			onConnected?.();
			onClose();
			Alert.alert("Connected", "You are now connected.");
		},
		onError: (err) => {
			setScanning(false);
			Alert.alert("Could not connect", err.message);
		},
	});

	const myCode = codeQuery.data?.code ?? "";

	const submit = (raw: string) => {
		const code = raw.trim();
		if (code.length < 4 || connectMutation.isPending) return;
		connectMutation.mutate({ code });
	};

	const onShare = async () => {
		if (!myCode) return;
		await Share.share({
			message: `Connect with me on MedSafe using this code: ${myCode}`,
		});
	};

	const startScan = async () => {
		if (!permission?.granted) {
			const result = await requestPermission();
			if (!result.granted) {
				Alert.alert(
					"Camera permission needed",
					"Allow camera access to scan a code.",
				);
				return;
			}
		}
		scannedRef.current = false;
		setScanning(true);
	};

	// Fullscreen QR scanner
	if (visible && scanning) {
		return (
			<Modal visible transparent={false} animationType="slide">
				<View className="flex-1 bg-black">
					<CameraView
						style={{ flex: 1 }}
						facing="back"
						barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
						onBarcodeScanned={({ data }) => {
							if (scannedRef.current || connectMutation.isPending) return;
							scannedRef.current = true;
							submit(data);
						}}
					/>
					<View className="absolute inset-x-0 top-16 items-center px-8">
						<Text className="text-center font-semibold text-base text-white">
							Point the camera at the other person's QR code
						</Text>
					</View>
					<TouchableOpacity
						onPress={() => setScanning(false)}
						className="absolute inset-x-0 bottom-12 mx-auto items-center justify-center self-center rounded-full bg-white/90 px-6 py-3"
					>
						<Text className="font-semibold text-base text-black">Cancel</Text>
					</TouchableOpacity>
				</View>
			</Modal>
		);
	}

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<View className="flex-1 justify-end bg-black/50">
				<View className="rounded-t-3xl bg-surface-light p-6 dark:bg-surface-dark">
					<View className="mb-5 flex-row items-center justify-between">
						<Text className="font-bold text-text-main-light text-xl dark:text-text-main-dark">
							Connect with a code
						</Text>
						<TouchableOpacity onPress={onClose} className="p-1">
							<Ionicons
								name="close"
								size={24}
								className="text-text-main-light dark:text-text-main-dark"
							/>
						</TouchableOpacity>
					</View>

					{/* My code + QR */}
					<View className="items-center rounded-2xl border border-border-light bg-background-light p-5 dark:border-border-dark dark:bg-background-dark">
						<Text className="mb-3 text-sm text-text-sub-light dark:text-text-sub-dark">
							Show this to connect
						</Text>
						{codeQuery.isError ? (
							<View className="h-[180px] w-[180px] items-center justify-center px-2">
								<Text className="text-center text-sm text-text-sub-light dark:text-text-sub-dark">
									{codeQuery.error.message}
								</Text>
							</View>
						) : codeQuery.isLoading || !myCode ? (
							<View className="h-[180px] w-[180px] items-center justify-center">
								<ActivityIndicator />
							</View>
						) : (
							<View className="rounded-xl bg-white p-3">
								<QRCode value={myCode} size={172} />
							</View>
						)}
						<Text className="mt-4 font-bold text-2xl text-text-main-light tracking-[4px] dark:text-text-main-dark">
							{myCode || "········"}
						</Text>
						<TouchableOpacity
							onPress={onShare}
							disabled={!myCode}
							className="mt-3 flex-row items-center gap-2 rounded-full bg-primary/10 px-4 py-2"
						>
							<Ionicons
								name="share-outline"
								size={18}
								className="text-primary"
							/>
							<Text className="font-semibold text-primary text-sm">
								Share code
							</Text>
						</TouchableOpacity>
					</View>

					{/* Divider */}
					<View className="my-5 flex-row items-center gap-3">
						<View className="h-px flex-1 bg-border-light dark:bg-border-dark" />
						<Text className="text-sm text-text-sub-light dark:text-text-sub-dark">
							or enter their code
						</Text>
						<View className="h-px flex-1 bg-border-light dark:bg-border-dark" />
					</View>

					{/* Enter / scan a code */}
					<View className="flex-row gap-3">
						<TextInput
							className="flex-1 rounded-xl border border-border-light bg-background-light px-4 py-3 text-base text-text-main-light uppercase dark:border-border-dark dark:bg-background-dark dark:text-text-main-dark"
							placeholder="ENTER CODE"
							placeholderTextColor="#9ca3af"
							autoCapitalize="characters"
							autoCorrect={false}
							value={entered}
							onChangeText={setEntered}
						/>
						<TouchableOpacity
							onPress={startScan}
							className="items-center justify-center rounded-xl border border-border-light px-4 dark:border-border-dark"
						>
							<Ionicons
								name="qr-code-outline"
								size={22}
								className="text-text-main-light dark:text-text-main-dark"
							/>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						onPress={() => submit(entered)}
						disabled={connectMutation.isPending || entered.trim().length < 4}
						className={`mt-4 items-center justify-center rounded-xl bg-primary py-3.5 ${
							connectMutation.isPending || entered.trim().length < 4
								? "opacity-50"
								: ""
						}`}
					>
						{connectMutation.isPending ? (
							<ActivityIndicator color="white" />
						) : (
							<Text className="font-bold text-base text-white">Connect</Text>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}
