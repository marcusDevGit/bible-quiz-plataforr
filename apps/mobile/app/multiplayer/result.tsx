import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";
import { socket } from "@/services/socket";
import { MatchAnswer } from "~/src/features/quiz/services/quiz.service";

export default function MultiplayerResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { players, winnerId, abandoned, answers } = useLocalSearchParams();

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };


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

  // Parse das respostas da partida para revisão
  let parsedAnswers: MatchAnswer[] = [];
  try {
    const rawAnswers = Array.isArray(answers) ? answers[0] : answers;
    if (typeof rawAnswers === "string" && rawAnswers.length > 0) {
      parsedAnswers = JSON.parse(rawAnswers);
    }
  } catch {
    console.warn("⚠️ Não foi possível carregar respostas para revisão.");
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

        {/* Grupo de Ações — 100% no padrão do Quiz Individual */}
        <View className="w-full flex-col gap-3 mt-4">
          <TouchableOpacity
            className="w-full py-4 rounded-full flex-row items-center justify-center gap-2"
            style={{ backgroundColor: isWinner ? "#fea619" : "#00236f" }}
            onPress={() => router.replace("/arena")}
            activeOpacity={0.8}
          >
            <MaterialIcons name="replay" size={20} color={isWinner ? "#684000" : "#ffffff"} />
            <Text className="text-sm font-bold" style={{ color: isWinner ? "#684000" : "#ffffff" }}>
              Jogar Novamente
            </Text>
          </TouchableOpacity>

          {/* Ação de Revisar Respostas — spec quiz_results */}
          <TouchableOpacity
            style={{ backgroundColor: "#ffffff", borderColor: "#00236f", borderWidth: 1.5 }}
            className="w-full p-4 rounded-2xl flex-row items-center justify-center gap-2"
            onPress={() => setIsReviewOpen(true)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="fact-check" size={20} color="#00236f" />
            <Text className="text-[#00236f] font-bold text-sm">
              Revisar Respostas ({parsedAnswers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full py-3 rounded-2xl flex-row items-center justify-center gap-2"
            onPress={() => router.replace("/")}
            activeOpacity={0.6}
          >
            <MaterialIcons name="home" size={20} color="#757682" />
            <Text className="text-sm font-bold text-on-surface-variant">
              Voltar ao Início
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Sanfona — 100% idêntico ao ResultScreen do Quiz Individual */}
      <Modal
        visible={isReviewOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsReviewOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 32,
          }}
        >
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 24,
              maxHeight: "85%",
              width: "100%",
              maxWidth: 550,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center justify-between pb-4 border-b border-[#e0e3eb] mb-4">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="fact-check" size={24} color="#00236f" />
                <Text className="text-lg font-bold text-on-surface">
                  Resumo da Partida
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsReviewOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f0f2f5] items-center justify-center"
              >
                <MaterialIcons name="close" size={18} color="#444651" />
              </TouchableOpacity>
            </View>

            {/* Lista de Respostas */}
            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[460px]">
              <View className="flex-col gap-3 my-2">
                {parsedAnswers.map((ans, idx) => {
                  const isExpanded = expandedIndex === idx;
                  return (
                    <View
                      key={idx}
                      style={{
                        backgroundColor: ans.isCorrect ? "#f0fdf4" : "#fef2f2",
                        borderColor: ans.isCorrect ? "#86efac" : "#fca5a5",
                        borderWidth: 1.5,
                      }}
                      className="p-4 rounded-2xl flex-col"
                    >
                      {/* Cabeçalho Clicável: Toca para expandir / recolher */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => toggleExpand(idx)}
                        className="flex-row items-center justify-between"
                      >
                        <View className="flex-row items-center gap-2 flex-1 mr-2">
                          <MaterialIcons
                            name={ans.isCorrect ? "check-circle" : "cancel"}
                            size={22}
                            color={ans.isCorrect ? "#16a34a" : "#dc2626"}
                          />
                          <Text className="font-semibold text-sm text-on-surface">
                            Questão {idx + 1}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <View
                            className={`px-2.5 py-0.5 rounded-full ${ans.isCorrect ? "bg-green-100" : "bg-red-100"
                              }`}
                          >
                            <Text
                              style={{
                                color: ans.isCorrect ? "#15803d" : "#b91c1c",
                              }}
                              className="text-[11px] font-bold uppercase tracking-wider"
                            >
                              {ans.isCorrect ? "Acertou" : "Errou"}
                            </Text>
                          </View>
                          <MaterialIcons
                            name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                            size={22}
                            color="#444651"
                          />
                        </View>
                      </TouchableOpacity>

                      {/* Conteúdo Expansível: Mostra Pergunta, Respostas e Explicação ao clicar */}
                      {isExpanded && (
                        <View className="mt-3 pt-3 border-t border-black/5 flex-col gap-3">
                          {/* Texto da Pergunta */}
                          <Text className="font-bold text-on-surface text-sm leading-snug">
                            {ans.questionTitle || "Enunciado da questão não registrado nesta partida."}
                          </Text>

                          {/* Bloco de Respostas */}
                          <View className="flex-col gap-1.5">
                            {/* Resposta do Usuário */}
                            <View
                              style={{
                                backgroundColor: ans.isCorrect ? "#dcfce7" : "#fee2e2",
                                borderColor: ans.isCorrect ? "#86efac" : "#fca5a5",
                                borderWidth: 1,
                              }}
                              className="p-2.5 rounded-xl flex-row items-start gap-2"
                            >
                              <MaterialIcons
                                name={ans.isCorrect ? "done" : "close"}
                                size={16}
                                color={ans.isCorrect ? "#15803d" : "#b91c1c"}
                                style={{ marginTop: 2 }}
                              />
                              <View className="flex-1">
                                <Text className="text-[10px] font-bold text-on-surface-variant uppercase">
                                  Sua resposta:
                                </Text>
                                <Text
                                  style={{ color: ans.isCorrect ? "#15803d" : "#b91c1c" }}
                                  className="text-xs font-semibold mt-0.5"
                                >
                                  {ans.selectedAlternative || (ans.isCorrect ? "Resposta correta" : "Tempo esgotado / Pulou")}
                                </Text>
                              </View>
                            </View>

                            {/* Resposta Correta (quando errou) */}
                            {!ans.isCorrect && ans.correctAlternative && (
                              <View
                                style={{
                                  backgroundColor: "#f0fdf4",
                                  borderColor: "#86efac",
                                  borderWidth: 1,
                                }}
                                className="p-2.5 rounded-xl flex-row items-start gap-2"
                              >
                                <MaterialIcons
                                  name="check"
                                  size={16}
                                  color="#15803d"
                                  style={{ marginTop: 2 }}
                                />
                                <View className="flex-1">
                                  <Text className="text-[10px] font-bold text-green-800 uppercase">
                                    Resposta Correta:
                                  </Text>
                                  <Text className="text-xs font-semibold text-green-900 mt-0.5">
                                    {ans.correctAlternative}
                                  </Text>
                                </View>
                              </View>
                            )}
                          </View>

                          {/* Explicação Bíblica e Referência */}
                          {(ans.explanation || ans.reference) && (
                            <View className="bg-white/80 rounded-xl p-3 border border-outline-variant/30 flex-col gap-1">
                              {ans.reference && (
                                <View className="flex-row items-center gap-1">
                                  <FontAwesome5 name="bible" size={11} color="#00236f" />
                                  <Text className="text-[11px] font-bold text-[#00236f]">
                                    {ans.reference}
                                  </Text>
                                </View>
                              )}
                              {ans.explanation && (
                                <Text className="text-xs text-on-surface-variant leading-relaxed">
                                  {ans.explanation}
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            {/* Fechar Modal */}
            <TouchableOpacity
              style={{ backgroundColor: "#00236f" }}
              className="w-full py-3.5 rounded-xl items-center justify-center mt-4"
              onPress={() => setIsReviewOpen(false)}
            >
              <Text className="text-white font-bold text-sm">Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView >
  );
}
