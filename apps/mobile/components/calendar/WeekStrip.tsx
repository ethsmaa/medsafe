import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface WeekStripProps {
	dates: Date[];
	selectedDate: Date;
	onSelectDate: (date: Date) => void;
}

const isSameDay = (d1: Date, d2: Date) =>
	d1.toISOString().split("T")[0] === d2.toISOString().split("T")[0];

export const WeekStrip = ({
	dates,
	selectedDate,
	onSelectDate,
}: WeekStripProps) => {
	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerClassName="gap-3 px-4 pb-4"
		>
			{dates.map((date, index) => {
				const isSelected = isSameDay(date, selectedDate);
				const isToday = isSameDay(date, new Date());

				return (
					<TouchableOpacity
						key={index}
						className={`min-w-[50px] items-center justify-center rounded-xl p-2 ${isSelected ? "bg-primary shadow-sm" : ""}`}
						onPress={() => onSelectDate(date)}
					>
						<Text
							className={`mb-1 font-semibold text-xs ${isSelected ? "text-white" : "text-text-sub-light dark:text-text-sub-dark"}`}
						>
							{date.toLocaleDateString("en-US", { weekday: "short" })}
						</Text>
						<View
							className={`h-9 w-9 items-center justify-center rounded-full ${
								isSelected
									? "bg-transparent"
									: isToday
										? "border border-primary bg-surface-light dark:bg-surface-dark"
										: "bg-border-light dark:bg-border-dark"
							}`}
						>
							<Text
								className={`font-bold text-base ${
									isSelected
										? "text-white"
										: isToday
											? "text-primary"
											: "text-text-main-light dark:text-text-main-dark"
								}`}
							>
								{date.getDate()}
							</Text>
						</View>
					</TouchableOpacity>
				);
			})}
		</ScrollView>
	);
};
