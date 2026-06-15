import { SafeAreaView, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ArenaRoute() {
  return (
    <SafeAreaView className="flex-1 bg-surface max-w-md mx-auto w-full relative justify-center items-center">
      <MaterialIcons name="sports-esports" size={64} color="#fea619" />
      <Text className="font-headline-md text-primary font-bold mt-4">
        Arena Multiplayer
      </Text>
      <Text className="font-body-md text-on-surface-variant text-center mt-2">
        Em breve: Batalhas em Tempo Real!
      </Text>
    </SafeAreaView>
  );
}
