import { SafeAreaView, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ExploreRoute() {
  return (
    <SafeAreaView className="flex-1 bg-surface max-w-md mx-auto w-full relative justify-center items-center">
      <MaterialIcons name="extension" size={64} color="#b6c4ff" />
      <Text className="font-headline-md text-primary font-bold mt-4">
        Menu de Quizzes
      </Text>
    </SafeAreaView>
  );
}
