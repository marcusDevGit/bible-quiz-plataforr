import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { quizService } from "@/features/quiz/services/quiz.service";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function QuizScreen() {
  const router = useRouter();

  const [startTime] = useState(() => Date.now());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const {
    data: questions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["quizQuestions"],
    queryFn: () => quizService.fetchRandomQuestions(10),
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-container-highest">
        <ActivityIndicator size="large" color="#00236f" />
        <Text className="mt-4 text-on-surface font-title-md">
          Preparando o desafio
        </Text>
      </View>
    );
  }
  if (isError || !questions || questions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-container-highest p-8">
        <Text className="text-error font-headline-md text-center">
          Banco de perguntas vazio ou erro de conexão
        </Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const alternatives = currentQuestion.alternatives || [];
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  const handleConfirm = () => {
    if (selectedOption === null) return;
    let newScore = score;

    const chosenAlternative = alternatives[selectedOption];
    if (chosenAlternative && chosenAlternative.isCorrect) {
      newScore = score + 1;
      setScore(newScore);
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      const finalTimeElapsed = Math.round((Date.now() - startTime) / 1000);
      router.replace({
        pathname: "/result",
        params: {
          score: newScore,
          total: questions.length,
          timeElapsed: finalTimeElapsed,
        },
      });
    }
  };

  const handleSkip = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      const finalTimeElapsed = Math.round((Date.now() - startTime) / 1000);
      router.replace({
        pathname: "/result",
        params: {
          score,
          total: questions.length,
          timeElapsed: finalTimeElapsed,
        },
      });
    }
  };
  return (
    <View className="flex-1 bg-surface-container-highest">
      <View className="w-full h-full flex flex-col bg-background relative shadow-2xl overflow-hidden">
        {/* Cabeçalho da Partida */}
        <View className="flex flex-col px-margin-mobile pt-16 pb-4 bg-surface z-10">
          <View className="flex-row items-center justify-between h-16">
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-lowest border border-surface-variant"
              onPress={() => router.back()}
            >
              <MaterialIcons name="close" size={20} color="#444651" />
            </TouchableOpacity>
            <View className="flex-row items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-full border border-surface-variant">
              <MaterialIcons name="timer" size={20} color="#fea619" />
              <Text className="font-title-md text-primary">15s</Text>
            </View>
            <View className="w-10 items-end">
              <Text className="font-label-lg text-on-surface-variant">
                {currentIndex + 1}/{questions.length}
              </Text>
            </View>
          </View>

          <View className="w-full h-3 bg-surface-variant rounded-full mt-2 overflow-hidden shadow-inner">
            <View
              className="h-full bg-secondary-container rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
        </View>
        {/* Área Central: Pergunta e Alternativas */}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
          className="flex-1 flex-col px-margin-mobile py-6 z-0"
        >
          <View className="mb-10 mt-4 px-2">
            <Text className="font-headline-md text-on-surface text-center leading-tight">
              {currentQuestion.title}
            </Text>
          </View>
          <View className="flex-col gap-4 mb-4">
            {alternatives.map((alt: any, index: any) => {
              const isSelected = selectedOption === index;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedOption(index)}
                  className={`w-full flex-row items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary-fixed-dim"
                      : "border-transparent bg-surface-container-lowest"
                  }`}
                >
                  <Text
                    className={`font-title-md pl-2 flex-1 ${isSelected ? "text-on-primary-fixed" : "text-on-surface"}`}
                  >
                    {alt.description}
                  </Text>
                  <MaterialIcons
                    name={
                      isSelected ? "check-circle" : "radio-button-unchecked"
                    }
                    size={28}
                    color={isSelected ? "#00236f" : "#c5c5d3"}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        {/* Rodapé: Pular e Confirmar */}
        <View className="px-margin-mobile pt-4 pb-12 bg-surface border-t border-surface-variant/50 flex-row gap-4 z-10">
          <TouchableOpacity
            className="flex-1 py-4 px-2 rounded-full border-2 border-outline-variant items-center justify-center"
            onPress={handleSkip}
          >
            <Text className="text-on-surface-variant font-label-lg">Pular</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-[2] py-4 px-6 rounded-full items-center justify-center flex-row gap-2 ${selectedOption !== null ? "bg-primary" : "bg-primary/50"}`}
            onPress={handleConfirm}
            disabled={selectedOption === null}
          >
            <Text className="text-on-primary font-label-lg">Confirmar</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}
