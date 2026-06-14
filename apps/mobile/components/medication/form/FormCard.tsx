import type { ReactNode } from "react";
import { Text, View } from "react-native";

interface FormCardProps {
	title: string;
	children: ReactNode;
	className?: string;
}

export const FormCard = ({ title, children, className }: FormCardProps) => (
	<View
		className={`gap-5 rounded-3xl bg-surface-light p-5 shadow-sm dark:bg-surface-dark ${className ?? ""}`}
	>
		<Text
			accessibilityRole="header"
			className="font-bold text-lg text-text-main-light dark:text-text-main-dark"
		>
			{title}
		</Text>
		{children}
	</View>
);
