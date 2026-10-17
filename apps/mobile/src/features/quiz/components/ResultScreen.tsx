import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { quizService, MatchAnswer } from "../services/quiz.service";

const BEST_TIME_KEY = "quiz_best_time_seconds";


export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Capturamos as variáveis que a tela de Quiz mandou
  const { score, total, timeElapsed, answers } = useLocalSearchParams();

  // Forçamos a tipagem segura para números
  const numScore = Number(score) || 0;
  const numTotal = Number(total) || 10;
  const xpGained = numScore * 15;
  const numTimeElapsed = Number(timeElapsed) || 0;

  const [isNewRecord, setIsNewRecord] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Parse defensivo: se o parâmetro vier quebrado, não crasha o app
  let parsedAnswers: MatchAnswer[] = [];
  try {
    if (typeof answers === "string" && answers.length > 0) {
      parsedAnswers = JSON.parse(answers);
    }
  } catch {
    console.warn("⚠️ Não foi possível fazer o parse das respostas.");
  }

  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    async function saveMatch() {
      try {
        const response = await quizService.submitMatch(numScore, parsedAnswers);
        console.log("✓ Partida salva no backend:", response);
      } catch (error) {
        console.error("❌ Erro ao salvar partida no backend:", error);
      }
    }
    saveMatch();
  }, [numScore, parsedAnswers]);

  useEffect(() => {
    async function evaluateRecord() {
      if (numTimeElapsed <= 0) return;
      try {
        const saved = await SecureStore.getItemAsync(BEST_TIME_KEY);
        const prevBest = saved ? Number(saved) : null;
        setBestTime(prevBest);

        if (prevBest === null || numTimeElapsed < prevBest) {
          await SecureStore.setItemAsync(BEST_TIME_KEY, String(numTimeElapsed));
          setIsNewRecord(true);
          setBestTime(numTimeElapsed);
        }

      } catch (error) {
        console.error("Erro ao avaliar recorde de tempo", error);
      }
    } evaluateRecord();
  }, [numTimeElapsed])

  // Formata o tempo decorrido em mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isPerfect = numScore === numTotal;
  const isLowScore = numScore < Math.ceil(numTotal / 2)

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f9fb" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1, paddingTop: insets.top + 16,
          paddingBottom: Math.max(insets.bottom + 24),
          paddingHorizontal: 20
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-xl mx-auto flex-col items-center ">
          <View className="items-center mb-6 mt-2">
            {isPerfect ? (
              <>
                <View
                  style={{ backgroundColor: "#ffeed4" }}
                  className="w-20 h-20 rounded-full items-center justify-center mb-4 border-2 border-[#fea619]"
                >
                  <MaterialIcons name="emoji-events" size={44} color="#fea619" />
                </View>
                <Text className="text-3xl font-bold text-[#00236f] mb-2 text-center">Maestria Perfeita 👑</Text>
                <Text className="text-base text-on-surface-variant text-center max-w-sm">
                  Incrivel! Você acertou todas as {numTotal} questões bíblicas.
                </Text>
              </>
            ) : isLowScore ? (
              <>
                <View
                  style={{ backgroundColor: "#e8edff" }}
                  className="w-20 h-20 rounded-full items-center justify-center mb-4 border-2 border-[#00236f]">
                  <FontAwesome5 name="bible" size={36} color="#00236f" />
                </View>
                <Text className="text-2xl font-bold text-on-surface mb-2 text-center">Continue Firme na Fé🙏</Text>
                <Text className="text-sm text-on-surface-variant text-center italic max-w-sm">
                  "Tudo posso naquele que me fortalece." (Filipenses 4:13)
                </Text>
              </>
            ) : (
              <>
                <View
                  style={{ backgroundColor: "#ffeed4" }}
                  className="w-20 h-20 rounded-full items-center justify-center mb-4"
                >
                  <MaterialIcons
                    name="workspace-premium"
                    size={44}
                    color="#fea619"
                  />
                </View>
                <Text className="text-3xl font-bold text-[#00236f] mb-2 text-center">
                  Excelente Trabalho! 🎉
                </Text>
                <Text className="text-base text-on-surface-variant text-center max-w-sm">
                  Você concluiu o quiz bíblico com ótimo aproveitamento.
                </Text>
              </>
            )}
          </View>

          <View className="flex-row w-full gap-3 mb-4">
            <View
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#e0e3eb",
                borderWidth: 1
              }}
              className="flex-1 rounded-2xl p-4 items-center justify-center">
              <MaterialIcons name="task-alt"
                size={28}
                color={isLowScore ? "#fea619" : "#4edea3"}
                className="mb-1" />
              <Text className="text-2xl font-bold text-on-surface">
                {numScore}/{numTotal}
              </Text>
              <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mt-1">
                Acertos
              </Text>
            </View>

            <View style={{
              backgroundColor: "#ffffff",
              borderColor: "#e0e3eb",
              borderWidth: 1
            }}
              className="flex-1 rounded-2xl p-4 items-center justify-center ">
              <MaterialIcons
                name="star"
                size={28}
                color="#fea619"
                className="mb-1"
              />
              <Text className="text-xl font-bold text-[#684000]">
                +{xpGained}
              </Text>
              <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mt-1">
                XP Ganho
              </Text>
            </View>
          </View>


        </View>


        {/* Card de Recorde de Tempo (Ocupa largura total - spec quiz_results) */}
        <View
          style={{
            backgroundColor: isNewRecord ? "#00236f" : "#ffffff",
            borderColor: isNewRecord ? "#00236f" : "#e0e3eb",
            borderWidth: 1
          }}
          className="w-full rounded-2xl p-4 flex-row items-center justify-between mb-4 shadow-sm">
          <View className="flex-row items-center gap-3">
            <MaterialIcons name="timer" size={24} color={isNewRecord ? "#fea619" : "#00236f"} />
            <View>
              <Text
                style={{ color: isNewRecord ? "#ffffff" : "#1c1b1f" }}
                className="font-bold text-lg ">
                {formatTime(numTimeElapsed)}
              </Text>
              <Text
                style={{ color: isNewRecord ? "#b6c4ff" : "#757682" }}
                className="text-xs">
                {isNewRecord
                  ? "Seu menor tempo até hoje"
                  : bestTime
                    ? `Melhor tempo ${formatTime(bestTime)}`
                    : "Tempo de conclusão"
                }
              </Text>
            </View>
          </View>

          {isNewRecord && (
            <View
              style={{ backgroundColor: "rgba(254, 166, 25, 0.2)" }}
              className="px-3 py-1 rounded-full border border-[#fea619]">
              <Text className="text-[#fea619] font-bold text-xs uppercase tracking-wider">
                🔥 Novo Recorde!
              </Text>
            </View>
          )}
        </View>

        {/* Banner de Impacto no Ranking (Fundo verde esmeralda translúcido) */}
        <View
          style={{ backgroundColor: "rgba(0, 49, 31, 0.08)" }}
          className="w-full rounded-2xl p-3 flex-row items-center justify-center gap-2 mb-4"
        >
          <MaterialIcons name="trending-up" size={20} color="#00875a" />
          <Text className="text-sm text-[#006644] font-semibold">
            {numScore > 0
              ? `+${numScore * 10} pontos adicionados ao Ranking Semanal!`
              : "Jogue novamente para subir no Ranking!"}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#e0e3eb",
            borderWidth: 1,
            borderLeftWidth: 4,
            borderLeftColor: isPerfect ? "#fea619" : "#00236f"
          }}
          className="w-full rounded-xl p-4 flex-row items-start gap-3 mb-6">
          <View
            style={{ backgroundColor: "#f0f2f5" }}
            className="rounded-full p-2">
            <MaterialIcons name={isPerfect ? "military-tech" : "menu-book"} size={24} color={isPerfect ? "#fea619" : "#00236f"} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-on-surface">
              {isPerfect
                ? "Conquista: Mestre das Escrituras"
                : isLowScore
                  ? "Em Busca das Sabedoria"
                  : "Conquista: Conhecedor da Palavra"
              }
            </Text>
            <Text className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              {isPerfect
                ? "Você alcançou 100% de precisão nesta partida individual."
                : isLowScore
                  ? "A perseverança gera caráter e esperança. Tente outra vez!"
                  : "Partida concluída com bravura e dedicação ao estudo bíblico."}
            </Text>
          </View>
        </View>

        <View className="w-full flex-col gap-3 mt-2">
          <TouchableOpacity
            className="w-full py-4 rounded-full flex-row items-center justify-center gap-2"
            onPress={() => router.replace("/quiz")}
            activeOpacity={0.8}
          >
            <MaterialIcons name="replay" size={20} color="#684000" />
            <Text className="text-sm font-bold text-[#684000]">
              {isLowScore ? "Tentar Novamente" : "Jogar Novamente"}
            </Text>
          </TouchableOpacity>

          {/* Ação de Revisar Respostas - spec quiz_results */}
          <TouchableOpacity
            style={{ backgroundColor: "#ffffff", borderColor: "#00236f", borderWidth: 1.5 }}
            className="w-full p-4 rounded-2xl flex-row items-center justify-center gap-2 "
            onPress={() => {
              setIsReviewOpen(true)
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="fact-check" size={20} color="#00236f" />
            <Text className="text-[#00236f] font-bold text-sm">
              Revisar Respostas ({parsedAnswers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full py-3 rounded-2xl flex-row items-center justify-center gap-2"
            onPress={() => router.replace("/(tabs)")}
            activeOpacity={0.6}
          >
            <MaterialIcons name="home" size={20} color="#757682" />
            <Text className="text-sm font-bold text-on-surface-variant">
              Voltar ao Início
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView >
      <Modal
        visible={isReviewOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsReviewOpen(false)}>
        <View
          style={{
            backgroundColor: "#ffffff",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: "75%",
            paddingBottom: Math.max(insets.bottom, 20),
          }}
          className="p-6 w-full max-w-xl mx-auto">
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
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-col gap-3">
              {parsedAnswers.map((ans, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: ans.isCorrect ? "#f0fdf4" : "#fef2f2",
                    borderColor: ans.isCorrect ? "#86efac" : "#fca5a5",
                    borderWidth: 1,
                  }}
                  className="p-4 rounded-xl flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3">
                    <MaterialIcons
                      name={ans.isCorrect ? "check-circle" : "cancel"}
                      size={22}
                      color={ans.isCorrect ? "#16a34a" : "#dc2626"}
                    />
                    <Text className="font-semibold text-sm text-on-surface">
                      Pergunta {idx + 1}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: ans.isCorrect ? "#15803d" : "#b91c1c",
                    }}
                    className="text-xs font-bold uppercase tracking-wider"
                  >
                    {ans.isCorrect ? "Acertou" : "Errou"}
                  </Text>
                </View>
              ))}
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
      </Modal >
      <StatusBar style="dark" />
    </View >
  );
}
