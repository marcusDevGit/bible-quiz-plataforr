import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { socket } from "@/services/socket";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";

export default function MultiplayerGameScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams();

  // Estados do Jogo
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Estados de Revelação da Rodada
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [correctAlternativeId, setCorrectAlternativeId] = useState<string | null>(null);
  const [explanationText, setExplanationText] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [roundScores, setRoundScores] = useState<any[]>([]);

  // Perfil do Jogador Logado
  const { data: profileData } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: () => authService.getProfile(),
  });
  const loggedUser = profileData?.user;

  useEffect(() => {
    // Escuta a próxima pergunta
    socket.on("next_question", (data: any) => {
      setQuestionIndex(data.questionIndex);
      setCurrentQuestion(data.question);
      setSelectedOptionId(null);
      setSubmitted(false);
      setShowingExplanation(false);
      setCorrectAlternativeId(null);
    });

    // Escuta o encerramento da rodada (ambos responderam)
    socket.on("round_end", (data: any) => {
      setCorrectAlternativeId(data.correctAlternativeId);
      setExplanationText(data.explanation);
      setReferenceText(data.reference);
      setRoundScores(data.results);
      setShowingExplanation(true);
    });

    // Escuta o encerramento do jogo
    socket.on("game_end", (data: any) => {
      router.replace({
        pathname: "/multiplayer/result",
        params: {
          code: String(code),
          players: JSON.stringify(data.players),
          winnerId: data.winnerId || "",
          abandoned: data.abandoned ? "true" : "false",
        },
      });
    });

    socket.on("error", (msg: string) => {
      Alert.alert("Erro", msg);
    });

    return () => {
      socket.off("next_question");
      socket.off("round_end");
      socket.off("game_end");
      socket.off("error");
    };
  }, [code]);

  const handleSelectAlternative = (altId: string) => {
    if (submitted || showingExplanation) return;
    setSelectedOptionId(altId);
    setSubmitted(true);
    // Envia a resposta selecionada ao backend em tempo real
    socket.emit("submit_answer", {
      code,
      alternativeId: altId,
    });
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      "Sair do Jogo",
      "Se você sair agora, seu oponente vencerá por WO. Deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            socket.emit("leave_room", { code });
            router.replace("/arena");
          },
        },
      ]
    );
  };

  if (!currentQuestion) {
    return (
      <SafeAreaView className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator size="large" color="#00236f" />
        <Text className="mt-4 text-on-surface-variant font-title-md">
          Aguardando início da partida...
        </Text>
      </SafeAreaView>
    );
  }

  // Encontra pontuações acumuladas dos dois jogadores
  const myPlayerScore = roundScores.find((p) => p.userId === loggedUser?.id);
  const otherPlayerScore = roundScores.find((p) => p.userId !== loggedUser?.id);

  return (
    <SafeAreaView className="flex-1 bg-surface max-w-md mx-auto w-full relative">
      {/* Cabeçalho da Partida */}
      <View className="flex flex-col px-margin-mobile pt-4 pb-2 bg-surface border-b border-outline-variant/30">
        <View className="flex-row items-center justify-between h-14">
          <TouchableOpacity
            onPress={handleLeaveRoom}
            className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-lowest border border-outline-variant/40"
          >
            <MaterialIcons name="close" size={20} color="#444651" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-4 bg-surface-container-lowest px-4 py-2 rounded-full border border-outline-variant/30">
            {/* Placar em Tempo Real */}
            <Text className="font-label-sm text-primary font-bold">
              Você: {myPlayerScore ? myPlayerScore.score : 0} XP
            </Text>
            <Text className="text-outline-variant font-bold">|</Text>
            <Text className="font-label-sm text-secondary font-bold">
              Rival: {otherPlayerScore ? otherPlayerScore.score : 0} XP
            </Text>
          </View>
          <Text className="font-label-lg font-bold text-on-surface-variant">
            {questionIndex + 1}/{totalQuestions}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-margin-mobile py-4"
      >
        {/* Título da pergunta */}
        <View className="my-6 px-1">
          <Text className="font-headline-md text-on-surface text-center leading-tight">
            {currentQuestion.title}
          </Text>
        </View>

        {/* Lista de alternativas */}
        <View className="flex-col gap-3.5 mb-6">
          {currentQuestion.alternatives.map((alt: any) => {
            const isSelected = selectedOptionId === alt.id;
            const isCorrect = correctAlternativeId === alt.id;
            const revealMode = correctAlternativeId !== null;

            // Determinar estilo dinâmico
            let itemStyle = "border-outline-variant/40 bg-surface-container-lowest";
            let textStyle = "text-on-surface";
            let checkIconName: keyof typeof MaterialIcons.glyphMap = "radio-button-unchecked";
            let checkIconColor = "#c5c5d3";

            if (isSelected && !revealMode) {
              itemStyle = "border-primary bg-primary-fixed-dim";
              textStyle = "text-on-primary-fixed font-bold";
              checkIconName = "check-circle";
              checkIconColor = "#00236f";
            } else if (revealMode) {
              if (isCorrect) {
                // Alternativa correta revelada
                itemStyle = "border-on-tertiary-container bg-tertiary-fixed-dim/20";
                textStyle = "text-on-tertiary-fixed-variant font-bold";
                checkIconName = "check-circle";
                checkIconColor = "#27c38a";
              } else if (isSelected) {
                // Errada selecionada pelo jogador
                itemStyle = "border-error bg-error-container/20";
                textStyle = "text-on-error-container font-bold";
                checkIconName = "cancel";
                checkIconColor = "#ba1a1a";
              } else {
                // Não selecionadas
                itemStyle = "border-outline-variant/20 bg-surface-container-low opacity-50";
              }
            }

            return (
              <TouchableOpacity
                key={alt.id}
                onPress={() => handleSelectAlternative(alt.id)}
                disabled={submitted || revealMode}
                className={`w-full flex-row items-center justify-between p-5 rounded-2xl border-2 ${itemStyle}`}
              >
                <Text className={`font-title-md flex-1 pl-2 ${textStyle}`}>
                  {alt.description}
                </Text>
                <MaterialIcons name={checkIconName} size={24} color={checkIconColor} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Painel de Explicação / Bíblico ao fim da rodada */}
        {showingExplanation && (
          <View
            style={{ borderLeftWidth: 4, borderColor: "#fea619" }}
            className="bg-surface-container-low rounded-xl p-4 shadow-sm"
          >
            <View className="flex-row items-center gap-2 mb-2">
              <MaterialIcons name="menu-book" size={20} color="#684000" />
              <Text className="font-title-sm font-bold text-on-secondary-container">
                Estudo & Contexto {referenceText ? `— ${referenceText}` : ""}
              </Text>
            </View>
            <Text className="font-body-md text-on-surface-variant leading-relaxed">
              {explanationText || "Nenhuma explicação adicional fornecida."}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
