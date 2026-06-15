// apps/mobile/app/result.tsx
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

export default function ResultScreen() {
  const router = useRouter();

  // Capturamos as variáveis que a tela de Quiz mandou
  const { score, total, timeElapsed } = useLocalSearchParams();

  // Forçamos a tipagem segura para números
  const numScore = Number(score) || 0;
  const numTotal = Number(total) || 10;
  const xpGained = numScore * 15;
  const numTimeElapsed = Number(timeElapsed) || 0;

  // Formata o tempo decorrido em mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View className="flex-1 bg-surface  max-w-md mx-auto w-full relative">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 flex-col items-center justify-center px-margin-mobile max-w-lg mx-auto w-full z-10 mt-8 py-8">
          <View className="items-center mb-8">
            <MaterialIcons
              name="workspace-premium"
              size={64}
              color="#fea619"
              className="mb-4"
            />
            <Text className="font-headline-lg text-[30px] font-bold leading-[36px] text-primary mb-1 text-center">
              Excelente Trabalho! 🎉
            </Text>
            <Text className="font-body-md text-[14px] text-on-surface-variant text-center">
              Você concluiu o quiz com sucesso.
            </Text>
          </View>

          <View className="flex-row w-full gap-4 mb-4">
            <View className="flex-1 bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container items-center justify-center">
              <MaterialIcons
                name="task-alt"
                size={32}
                color="#4edea3"
                className="mb-2"
              />
              <Text className="font-headline-md text-[24px] font-semibold text-on-surface">
                {numScore}/{numTotal}
              </Text>
              <Text className="font-label-sm text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mt-1">
                Acertos
              </Text>
            </View>

            <View className="flex-1 bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container items-center justify-center relative overflow-hidden">
              <View className="absolute inset-0 bg-secondary-container opacity-10" />
              <MaterialIcons
                name="star"
                size={32}
                color="#fea619"
                className="mb-2"
              />
              <Text className="font-headline-md text-[24px] font-semibold text-secondary-container">
                +{xpGained}
              </Text>
              <Text className="font-label-sm text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mt-1">
                XP Ganho
              </Text>
            </View>
          </View>

          {/* Card de Recorde de Tempo (Ocupa largura total - spec quiz_results) */}
          <View className="w-full bg-primary rounded-xl p-4 shadow-sm flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="timer" size={24} color="#fea619" />
              <Text className="font-title-md text-white text-[18px] font-semibold">
                {formatTime(numTimeElapsed)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="font-label-sm text-primary-fixed-dim text-[12px] font-medium uppercase tracking-wider">
                Novo Recorde de Tempo!
              </Text>
            </View>
          </View>

          {/* Banner de Impacto no Ranking (Fundo verde esmeralda translúcido) */}
          <View
            className="w-full rounded-xl p-3 flex-row items-center justify-center gap-2 mb-4"
            style={{ backgroundColor: "rgba(0, 49, 31, 0.1)" }}
          >
            <MaterialIcons name="trending-up" size={20} color="#4edea3" />
            <Text className="font-label-lg text-tertiary text-[14px] font-semibold">
              Subiu 15 posições no Ranking Semanal!
            </Text>
          </View>

          <View className="w-full bg-surface-container-lowest rounded-xl p-4 shadow-sm border-l-4 border-secondary-container flex-row items-start gap-3 mb-4">
            <View className="bg-surface-container rounded-full p-2">
              <MaterialIcons name="military-tech" size={24} color="#fea619" />
            </View>
            <View className="flex-1">
              <Text className="font-title-md text-[18px] font-semibold text-on-surface">
                Mestre do Quiz
              </Text>
              <Text className="font-body-md text-[14px] text-on-surface-variant mt-1">
                Conquista desbloqueada! Você testou seus conhecimentos com
                bravura.
              </Text>
            </View>
          </View>

          <View className="w-full flex-col gap-3 mt-6">
            <TouchableOpacity
              className="w-full bg-secondary-container p-4 rounded-full flex-row items-center justify-center gap-2"
              onPress={() => router.replace("/quiz")}
            >
              <MaterialIcons name="replay" size={20} color="#684000" />
              <Text className="font-label-lg text-[14px] font-semibold text-on-secondary-container">
                Jogar Novamente
              </Text>
            </TouchableOpacity>

            {/* Ação de Revisar Respostas - spec quiz_results */}
            <TouchableOpacity
              className="w-full bg-surface-container-high p-4 rounded-full flex-row items-center justify-center gap-2 border border-primary/20"
              onPress={() => {
                Alert.alert(
                  "Revisão de Respostas",
                  "Funcionalidade em desenvolvimento para a próxima fase!",
                );
              }}
            >
              <MaterialIcons name="fact-check" size={20} color="#00236f" />
              <Text className="font-label-lg text-[14px] font-semibold text-primary">
                Revisar Respostas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full bg-transparent p-4 rounded-full flex-row items-center justify-center gap-2"
              onPress={() => router.replace("/")}
            >
              <MaterialIcons name="home" size={20} color="#444651" />
              <Text className="font-label-lg text-[14px] font-semibold text-on-surface-variant">
                Início
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <StatusBar style="dark" />
    </View>
  );
}
