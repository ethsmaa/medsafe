import { useUser } from "@/hooks/use-user";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
	const { data: user } = useUser();
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
			<Text>Home</Text>
			<Text>{JSON.stringify(user)}</Text>
		</SafeAreaView>
	);
}
