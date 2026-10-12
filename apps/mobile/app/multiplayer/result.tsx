import { useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";
import { socket } from "@/services/socket";

export default function MultiplayerResultScreen() {
  const router = useRouter();
  const { players, winnerId, abandoned } = useLocalSearchParams();

  // Garante a desconexão do socket quando o jogo terminar
  useEffect(() => {
    if (socket.connected) {
      socket.disconnect();
    }
  }, []);

  // Busca perfil logado
  const { data: profileData } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: () => authService.getProfile(),
  });
  const loggedUser = profileData?.user;

  // Parse das pontuações dos jogadores
  let parsedPlayers: any[] = [];
  try {
    if (typeof players === "string" && players.length > 0) {
      parsedPlayers = JSON.parse(players);
    }
  } catch (error) {
    console.warn("⚠️ Não foi possível carregar placar dos jogadores.");
  }

  const isAbandoned = abandoned === "true";
  const myPlayer = parsedPlayers.find((p) => p.userId === loggedUser?.id);
  const otherPlayer = parsedPlayers.find((p) => p.userId !== loggedUser?.id);

  const isWinner = winnerId === loggedUser?.id;
  const isLoser = winnerId !== loggedUser?.id && winnerId !== "";
  const isDraw = winnerId === "";

  // Determinar header e ícone com base no resultado
  let resultTitle = "Empate! 🤝";
  let resultDesc = "Ambos lutaram bravamente!";
  let resultIconName: keyof typeof MaterialIcons.glyphMap = "handshake";
  let resultIconColor = "#fea619";

  if (isAbandoned) {
    resultTitle = "Vitória por WO! 🏃💨";
    resultDesc = "O oponente abandonou a partida.";
    resultIconName = "sentiment-very-satisfied";
    resultIconColor = "#4edea3";
  } else if (isWinner) {
    resultTitle = "Vitória! 🏆";
    resultDesc = "Você demonstrou grande sabedoria bíblica!";
    resultIconName = "emoji-events";
    resultIconColor = "#fea619";
  } else if (isLoser) {
    resultTitle = "Derrota... 😔";
    resultDesc = "Continue estudando para vencer a próxima!";
    resultIconName = "sentiment-very-dissatisfied";
    resultIconColor = "#ba1a1a";
  }

  return (
    <SafeAreaView className="flex-1 bg-surface max-w-md mx-auto w-full relative">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        showsVerticalScrollIndicator={false}
        className="px-margin-mobile py-8"
      >
        {/* Ícone e Título principal */}
        <View className="items-center mb-8">
          <MaterialIcons name={resultIconName} size={80} color={resultIconColor} className="mb-4" />
          <Text className="font-headline-lg text-[30px] font-bold leading-[36px] text-primary mb-1 text-center">
            {resultTitle}
          </Text>
          <Text className="font-body-md text-[14px] text-on-surface-variant text-center px-4">
            {resultDesc}
          </Text>
        </View>

        {/* Placar Final */}
        <View className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 mb-8">
          <Text className="font-label-sm text-on-surface-variant text-[11px] uppercase tracking-wider text-center mb-4">
            Placar Final (XP)
          </Text>

          <View className="flex-col gap-4">
            {/* Meu Score */}
            <View className="flex-row items-center justify-between bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 shadow-sm">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-primary-container items-center justify-center">
                  <MaterialIcons name="person" size={20} color="#00236f" />
                </View>
                <Text className="font-title-md font-bold text-on-surface">
                  {myPlayer ? `${myPlayer.name} (Você)` : "Você"}
                </Text>
              </View>
              <Text className="font-headline-md text-primary font-extrabold">
                {myPlayer ? `${myPlayer.score} XP` : "0 XP"}
              </Text>
            </View>

            {/* Score do Oponente */}
            <View className="flex-row items-center justify-between bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 shadow-sm">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-secondary-container/20 items-center justify-center">
                  <MaterialIcons name="person" size={20} color="#855300" />
                </View>
                <Text className="font-title-md font-bold text-on-surface">
                  {otherPlayer ? otherPlayer.name : "Oponente"}
                </Text>
              </View>
              <Text className="font-headline-md text-secondary font-extrabold">
                {otherPlayer ? `${otherPlayer.score} XP` : "0 XP"}
              </Text>
            </View>
          </View>
        </View>

        {/* Botões de Navegação */}
        <View className="flex-col gap-3">
          <TouchableOpacity
            onPress={() => router.replace("/arena")}
            className="w-full bg-primary p-4 rounded-full flex-row items-center justify-center gap-2"
          >
            <MaterialIcons name="replay" size={20} color="#ffffff" />
            <Text className="font-label-lg text-[14px] font-semibold text-white">
              Jogar Novamente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/")}
            className="w-full bg-surface-container-high p-4 rounded-full flex-row items-center justify-center gap-2 border border-outline-variant/35"
          >
            <MaterialIcons name="home" size={20} color="#444651" />
            <Text className="font-label-lg text-[14px] font-semibold text-on-surface-variant">
              Voltar ao Início
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
