import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { quizService, MatchAnswer } from "@/features/quiz/services/quiz.service";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SECONDS_PER_QUESTION = 30;
const LETTERS = ["A", "B", "C", "D"];

export default function QuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [startTime] = useState(() => Date.now());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<MatchAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);

  const {
    data: questions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["quizQuestions"],
    queryFn: () => quizService.fetchRandomQuestions(10),
  });

  const finishQuiz = useCallback(
    (finalScore: number, finalAnswers: MatchAnswer[]) => {
      const finalTimeElapsed = Math.round((Date.now() - startTime) / 1000);
      router.replace({
        pathname: "/result",
        params: {
          score: finalScore,
          total: questions?.length || 10,
          timeElapsed: finalTimeElapsed,
          answers: JSON.stringify(finalAnswers),
        },
      });
    },
    [questions, router, startTime]
  );

  const handleTimeoutOrSkip = useCallback(() => {
    if (!questions || !questions[currentIndex]) return;
    const currentQ = questions[currentIndex];
    const correctAlt = currentQ.alternatives.find((a: any) => a.isCorrect);
    const updatedAnswers: MatchAnswer[] = [
      ...answers,
      {
        questionId: currentQ.id, isCorrect: false,
        questionTitle: currentQ.title,
        reference: currentQ.reference,
        explanation: currentQ.explanation,
        selectedAlternative: "Tempo esgotado / Pulou",
        correctAlternative: correctAlt?.description,

      },
    ];
    setAnswers(updatedAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTimeLeft(SECONDS_PER_QUESTION)
    } else {
      finishQuiz(score, updatedAnswers);
    }
  }, [answers, currentIndex, finishQuiz, questions, score])

  useEffect(() => {
    if (isLoading || isError || !questions || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeoutOrSkip();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, handleTimeoutOrSkip, isError, isLoading, questions]);

  // Confirmar resposta selecionada
  const handleConfirm = () => {
    if (selectedOption === null || !questions) return;
    const currentQ = questions[currentIndex];
    const alternatives = currentQ.alternatives || [];
    const chosenAlternative = alternatives[selectedOption];
    const isCorrect = !!(chosenAlternative && chosenAlternative.isCorrect);

    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setScore(newScore);
    }

    const correctAlt = currentQ.alternatives.find((a: any) => a.isCorrect);
    const selectedAlt = currentQ.alternatives[selectedOption];
    const updatedAnswers: MatchAnswer[] = [
      ...answers,
      {
        questionId: currentQ.id, isCorrect,
        questionTitle: currentQ.title,
        reference: currentQ.reference,
        explanation: currentQ.explanation,
        selectedAlternative: selectedAlt?.description || "",
        correctAlternative: correctAlt?.description || "",
      },
    ];
    setAnswers(updatedAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTimeLeft(SECONDS_PER_QUESTION);
    } else {
      finishQuiz(newScore, updatedAnswers);
    }
  };

  // Diálogo de confirmação para sair
  const handleExit = () => {
    Alert.alert(
      "Sair da Partida?",
      "Se você sair agora, seu progresso nesta partida será perdido.",
      [
        { text: "Continuar Jogando", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => router.replace("/(tabs)"),
        },
      ]
    );
  };


  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-container-highest">
        <ActivityIndicator size="large" color="#00236f" />
        <Text className="mt-4 text-on-surface font-title-md">
          Preparando as Escrituras...
        </Text>
      </View>
    );
  }

  if (isError || !questions || questions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-container-highest p-8">
        <MaterialIcons name="error-outline" size={48} color="#ba1a1a" />
        <Text className="text-error font-headline-md text-center">
          Banco de perguntas vazio ou erro de conexão
        </Text>
        <TouchableOpacity className="mt-6 px-6 py-3 bg-primary rounded-full" onPress={() => router.back()}>
          <Text className="text-white font-body">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const alternatives = currentQuestion.alternatives || [];
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;
  const isTimeCritical = timeLeft <= 5;



  return (
    <View style={{ flex: 1, backgroundColor: "#f7f9fb" }}>
      <View className="w-full h-full flex flex-col justify-between">

        {/* TopBar & Progresso */}
        <View
          style={{
            paddingTop: insets.top + 8,
            backgroundColor: "#ffffff",
            borderBottomWidth: 1,
            borderBottomColor: "#e6e8ea"
          }}
          className="px-5 pb-3 z-10"
        >
          <View className="flex-row items-center justify-between h-14">
            {/* Botão Fechar com Confirmação */}
            <TouchableOpacity
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#c5c5d3",
                borderWidth: 1,
              }}
              className="w-10 h-10 items-center justify-center rounded-full"
              onPress={handleExit}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={20} color="#444651" />
            </TouchableOpacity>

            {/* Cronômetro Dinâmico */}
            <View
              style={{
                backgroundColor: isTimeCritical ? "#fef2f2" : "#ffffff",
                borderColor: isTimeCritical ? "#fca5a5" : "#e0e3eb",
                borderWidth: 1,
              }}
              className="flex-row items-center gap-2 px-4 py-1.5 rounded-full"
            >
              <MaterialIcons
                name="timer"
                size={18}
                color={isTimeCritical ? "#ba1a1a" : "#fea619"}
              />
              <Text
                style={{ color: isTimeCritical ? "#ba1a1a" : "#00236f" }}
                className="font-bold text-sm"
              >
                {timeLeft}s
              </Text>
            </View>

            {/* Contador de Perguntas */}
            <View
              style={{
                backgroundColor: "#f0f2f5",
                borderColor: "#e0e3eb",
                borderWidth: 1,
              }}
              className="px-3 py-1 rounded-full"
            >
              <Text className="font-bold text-xs text-on-surface-variant">
                {currentIndex + 1} de {questions.length}
              </Text>
            </View>
          </View>
          {/* Barra de Progresso */}
          <View
            style={{ backgroundColor: "#e6e8ea" }}
            className="w-full h-2 rounded-full mt-3 overflow-hidden"
          >
            <View
              className="h-full bg-secondary-container rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
        </View>
        {/* Área Central: Categoria, Pergunta e Alternativas */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
            paddingVertical: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-2xl mx-auto">
            {/* Badges de Metadados: Categoria e Referência */}
            <View className="flex-row items-center justify-center gap-2 mb-4">
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
            {/* Texto da Questão */}
            <View className="mb-8">
              <Text className="text-2xl font-bold text-on-surface text-center leading-snug">
                {currentQuestion.title}
              </Text>
            </View>
            {/* Alternativas */}
            <View className="flex-col gap-3">
              {alternatives.map((alt, index) => {
                const isSelected = selectedOption === index;
                const letter = LETTERS[index] || `${index + 1}`;
                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    onPress={() => setSelectedOption(index)}
                    style={{
                      borderColor: isSelected ? "#00236f" : "#e0e3eb",
                      backgroundColor: isSelected ? "#eef2ff" : "#ffffff",
                      borderWidth: 2,
                    }}
                    className="w-full flex-row items-center justify-between p-4 rounded-2xl"
                  >
                    {/* Badge da Letra (A, B, C, D) */}
                    <View
                      style={{
                        backgroundColor: isSelected ? "#00236f" : "#f0f2f5",
                      }}
                      className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                    >
                      <Text
                        style={{
                          color: isSelected ? "#ffffff" : "#444651",
                        }}
                        className="font-bold text-sm"
                      >
                        {letter}
                      </Text>
                    </View>
                    {/* Descrição da Opção */}
                    <Text
                      style={{
                        color: isSelected ? "#00236f" : "#1c1b1f",
                        fontWeight: isSelected ? "600" : "500",
                      }}
                      className="text-base flex-1"
                    >
                      {alt.description}
                    </Text>
                    {/* Indicador de Seleção */}
                    <MaterialIcons
                      name={
                        isSelected ? "check-circle" : "radio-button-unchecked"
                      }
                      size={24}
                      color={isSelected ? "#00236f" : "#c5c5d3"}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
        {/* Rodapé: Pular e Confirmar com Safe Area Insets */}
        <View
          style={{
            paddingTop: 16,
            paddingBottom: Math.max(insets.bottom + 12, 28),
            paddingHorizontal: 20,
            backgroundColor: "#ffffff",
            borderTopWidth: 1,
            borderTopColor: "#e6e8ea",
          }}
          className="w-full max-w-2xl mx-auto flex-row gap-3"
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#c5c5d3",
              borderWidth: 1,
            }}
            className="flex-1 py-4 px-2 rounded-2xl items-center justify-center"
            onPress={handleTimeoutOrSkip}
            activeOpacity={0.7}
          >
            <Text className="text-on-surface-variant font-bold text-sm">
              Pular
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: selectedOption !== null ? "#00236f" : "#8ea4d2",
            }}
            className="flex-[2] py-4 px-6 rounded-2xl items-center justify-center flex-row gap-2"
            onPress={handleConfirm}
            disabled={selectedOption === null}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-sm">Confirmar</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="dark" />
    </View>
  );

}
