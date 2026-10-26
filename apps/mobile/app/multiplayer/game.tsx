import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { socket } from "@/services/socket";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";
import { MatchAnswer } from "~/src/features/quiz/services/quiz.service";

export default function MultiplayerGameScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams();

  // Estados do Jogo
  const SECONDS_PER_QUESTION = 15;
  const EXPLANATION_DURATION = 5;
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [nextQuestionCountdown, setNextQuestionCountdown] = useState(EXPLANATION_DURATION);
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

  const answerHistoryRef = useRef<MatchAnswer[]>([]);
  const currentQuestionRef = useRef<any>(null);
  const selectedOptionIdRef = useRef<string | null>(null);

  // Perfil do Jogador Logado
  const { data: profileData } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: () => authService.getProfile(),
  });
  const loggedUser = profileData?.user;
  const loggedUserRef = useRef(loggedUser);
  useEffect(() => {
    loggedUserRef.current = loggedUser;
  }, [loggedUser]);


  useEffect(() => {
    // Escuta a próxima pergunta
    if (!socket.connected) {
      socket.connect()
    }

    if (code) {
      socket.emit("get_current_question", { code: String(code) })
    }
    socket.on("next_question", (data: any) => {
      setQuestionIndex(data.questionIndex);
      if (data.totalQuestions) {
        setTotalQuestions(data.totalQuestions)
      }
      setCurrentQuestion(data.question);
      currentQuestionRef.current = data.question;
      setSelectedOptionId(null);
      selectedOptionIdRef.current = null
      setSubmitted(false);
      setShowingExplanation(false);
      setCorrectAlternativeId(null);
      setTimeLeft(SECONDS_PER_QUESTION);

    });

    // Escuta o encerramento da rodada (ambos responderam)
    socket.on("round_end", (data: any) => {
      setCorrectAlternativeId(data.correctAlternativeId);
      setExplanationText(data.explanation);
      setReferenceText(data.reference);
      setRoundScores(data.results);
      setShowingExplanation(true);
      setNextQuestionCountdown(EXPLANATION_DURATION)

      // Salva histórico 
      const currQ = currentQuestionRef.current;
      if (currQ) {
        // const myResult = data.results.find((r: any) => r.userId === loggedUser?.id);
        const myResult = data.results?.find((r: any) => r.userId === (loggedUserRef.current?.id || loggedUser?.id));
        const mySelectedId = selectedOptionIdRef.current;
        const selectedAlt = currQ.alternatives?.find((a: any) => a.id === mySelectedId);
        const correctAlt = currQ.alternatives?.find((a: any) => a.id === data.correctAlternativeId);

        answerHistoryRef.current.push({
          questionId: currQ.id,
          isCorrect: myResult ? myResult.isCorrect : false,
          questionTitle: currQ.title,
          reference: data.reference,
          explanation: data.explanation,
          selectedAlternative: selectedAlt?.description || (mySelectedId ? "Opção selecionada" : "Não respondeu a tempo"),
          correctAlternative: correctAlt?.description || "",
        })
      }
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
          answers: JSON.stringify(answerHistoryRef.current),
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

  // Efeito do Cronômetro regressivo
  useEffect(() => {
    if (!currentQuestion || showingExplanation) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, showingExplanation, questionIndex]);

  // Efeito do Cronômetro de Transição para a próxima pergunta (5 segundos)
  useEffect(() => {
    if (!showingExplanation) return;

    const transitionTimer = setInterval(() => {
      setNextQuestionCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(transitionTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(transitionTimer);
  }, [showingExplanation]);


  const handleSelectAlternative = (altId: string) => {
    if (submitted || showingExplanation) return;
    setSelectedOptionId(altId);
    selectedOptionIdRef.current = altId
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
    <SafeAreaView className="flex-1 bg-surface w-full relative">
      {/* Cabeçalho da Partida */}
      <View className="w-full bg-surface border-b border-outline-variant/30">
        <View className="max-w-2xl mx-auto w-full flex-row items-center justify-between px-margin-mobile pt-4 pb-2">
          <TouchableOpacity
            onPress={handleLeaveRoom}
            className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-lowest border border-outline-variant/40"
          >
            <MaterialIcons name="close" size={20} color="#444651" />
          </TouchableOpacity>
          {/* Placar em Tempo Real */}
          <View className="flex-row items-center gap-3 bg-surface-container-lowest px-3 py-1.5 rounded-full border border-outline-variant/30">
            <Text className="font-label-sm text-primary font-bold">
              Você: {myPlayerScore ? myPlayerScore.score : 0} XP
            </Text>
            <Text className="text-outline-variant font-bold">|</Text>
            <Text className="font-label-sm text-secondary font-bold">
              Rival: {otherPlayerScore ? otherPlayerScore.score : 0} XP
            </Text>
          </View>
          {/* Cronômetro Regressivo */}
          <View
            style={{
              backgroundColor: showingExplanation
                ? "#e0f2fe"
                : timeLeft <= 4
                  ? "#fef2f2"
                  : "#ffffff",
              borderColor: showingExplanation
                ? "#7dd3fc"
                : timeLeft <= 4
                  ? "#fca5a5"
                  : "#e0e3eb",
              borderWidth: 1,
            }}
            className="flex-row items-center gap-1.5 px-3 py-1 rounded-full"
          >
            <MaterialIcons
              name={showingExplanation ? "fast-forward" : "timer"}
              size={16}
              color={
                showingExplanation
                  ? "#0284c7"
                  : timeLeft <= 4
                    ? "#ba1a1a"
                    : "#fea619"
              }
            />
            <Text
              style={{
                color: showingExplanation
                  ? "#0369a1"
                  : timeLeft <= 4
                    ? "#ba1a1a"
                    : "#00236f",
              }}
              className="font-bold text-xs"
            >
              {showingExplanation ? `${nextQuestionCountdown}s` : `${timeLeft}s`}
            </Text>
          </View>

        </View>
        {/* Barra de Progresso do Tempo */}
        <View style={{ backgroundColor: "#e6e8ea" }} className="w-full h-1.5 overflow-hidden">
          <View
            style={{
              width: `${(timeLeft / SECONDS_PER_QUESTION) * 100}%`,
              backgroundColor: timeLeft <= 4 ? "#ba1a1a" : "#fea619",
            }}
            className="h-full rounded-r-full transition-all"
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        className="flex-1 w-full"
      >
        <View className="max-w-2xl mx-auto w-full mt-4 px-4 py-4">
          {/* Badges de Metadados: Categoria ("Evangelhos") e Referência */}
          <View className="flex-row items-center justify-center gap-2 mt-6 mb-2">
            {currentQuestion.category && (
              <View
                style={{ backgroundColor: "#e8edff" }}
                className="flex-row items-center gap-1 px-3 py-1 rounded-full"
              >
                <MaterialIcons name="local-offer" size={12} color="#00236f" />
                <Text className="text-primary font-bold text-xs uppercase tracking-wider">
                  {currentQuestion.category.name}
                </Text>
              </View>
            )}
            {currentQuestion.reference && (
              <View
                style={{ backgroundColor: "#ffeed4" }}
                className="flex-row items-center gap-1 px-3 py-1 rounded-full"
              >
                <FontAwesome5 name="bible" size={10} color="#684000" />
                <Text className="text-on-secondary-container font-semibold text-xs">
                  {currentQuestion.reference}
                </Text>
              </View>
            )}
          </View>


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

          {/* Aviso de Espera: quando você já respondeu mas o rival ainda não */}
          {submitted && !showingExplanation && (
            <View className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex-row items-center justify-center gap-3 mt-2 mb-4">
              <ActivityIndicator size="small" color="#fea619" />
              <Text className="font-body-md text-on-surface-variant font-semibold">
                Resposta enviada! Aguardando oponente...
              </Text>
            </View>
          )}


          {/* Painel de Explicação / Bíblico ao fim da rodada */}
          {showingExplanation && (
            <View className="flex-col gap-3">
              {/* Banner com Contador da Próxima Pergunta */}
              <View className="bg-primary/10 border border-primary/25 rounded-2xl p-4 flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="fast-forward" size={22} color="#00236f" />
                  <Text className="font-title-md font-bold text-primary">
                    Próxima pergunta em
                  </Text>
                </View>
                <View className="bg-primary px-3.5 py-1.5 rounded-full">
                  <Text className="font-headline-sm font-extrabold text-white text-sm">
                    {nextQuestionCountdown}s
                  </Text>
                </View>
              </View>

              {/* Card com Estudo Bíblico e Referência */}
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
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
