import React, { useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Achievement, achievementsService } from "../services/achievements.service";
import { ACHIEVEMENT_GUIDES, DEFAULT_GUIDE } from "../constants/achievements.constants";
import { AchievementCard } from "./AchievementCard";
import { AchievementDetailModal } from "./AchievementDetailModal";

export default function AchievementsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [selectedAch, setSelectedAch] = useState<Achievement | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["myAchievements"],
    queryFn: () => achievementsService.getMyAchievements(),
  });

  const achievements = data?.achievements ?? [];
  const unlockedCount = achievements.filter((a) => !!a.unlocked || !!a.unlockedAt).length;
  const totalCount = achievements.length;
  const progressRatio = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Filtragem dinâmica por Tipo e Status
  const filteredAchievements = achievements.filter((ach) => {
    const isUnlocked = !!ach.unlocked || !!ach.unlockedAt;
    const guide = ACHIEVEMENT_GUIDES[ach.code] ?? DEFAULT_GUIDE;

    if (filter === "unlocked") return isUnlocked;
    if (filter === "locked") return !isUnlocked;
    if (filter === "biblical") return guide.category === "biblical";
    if (filter === "streak") return guide.category === "streak";
    if (filter === "progression") return guide.category === "progression";
    if (filter === "multiplayer") return guide.category === "multiplayer";
    return true;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fb" }}>
      {/* TopAppBar com Botão Voltar */}
      <View
        style={{
          height: 60,
          borderBottomWidth: 1,
          borderBottomColor: "#e6e8ea",
          backgroundColor: "#ffffff",
        }}
        className="flex-row items-center justify-between px-5 w-full"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, justifyContent: "center" }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#00236f" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-1.5">
          <MaterialIcons name="emoji-events" size={20} color="#fea619" />
          <Text
            style={{
              color: "#00236f",
              fontSize: 18,
              fontWeight: "bold",
              letterSpacing: -0.3,
            }}
          >
            Galeria de Conquistas
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Conteúdo Principal Rolável */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
      >
        <View className="w-full max-w-xl mx-auto">
          {/* Card de Resumo do Progresso Geral */}
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: "#e6e8ea",
              shadowColor: "#00236f",
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: "rgba(254, 166, 25, 0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="workspace-premium" size={28} color="#855300" />
            </View>

            <View style={{ flex: 1 }}>
              <View className="flex-row justify-between items-center mb-1.5">
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#444651" }}>
                  Progresso Total
                </Text>
                <Text style={{ fontSize: 13, fontWeight: "bold", color: "#00236f" }}>
                  {unlockedCount} / {totalCount} ({progressRatio}%)
                </Text>
              </View>

              <View
                style={{
                  height: 8,
                  backgroundColor: "#eceef0",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${progressRatio}%`,
                    backgroundColor: "#00236f",
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          </View>

          {/* Dica de Toque */}
          <View className="flex-row items-center gap-1.5 mb-3 px-1">
            <MaterialIcons name="touch-app" size={15} color="#757682" />
            <Text style={{ color: "#757682", fontSize: 12 }}>
              Toque em uma medalha para ver como desbloquear
            </Text>
          </View>

          {/* Chips de Filtro por Tipo e Status */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 14 }}
          >
            {[
              { id: "all", label: `Todas (${totalCount})` },
              { id: "biblical", label: "📖 Bíblico" },
              { id: "streak", label: "🔥 Consistência" },
              { id: "progression", label: "📈 Progressão" },
              { id: "unlocked", label: `Desbloqueadas (${unlockedCount})` },
              { id: "locked", label: `Bloqueadas (${totalCount - unlockedCount})` },
            ].map((chip) => {
              const active = filter === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  onPress={() => setFilter(chip.id)}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: active ? "#00236f" : "#ffffff",
                    borderColor: active ? "#00236f" : "#c5c5d3",
                    borderWidth: 1,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      color: active ? "#ffffff" : "#444651",
                      fontSize: 12,
                      fontWeight: active ? "700" : "500",
                    }}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Grid de Conquistas em 2 Colunas */}
          {isLoading ? (
            <View className="py-16 items-center justify-center">
              <ActivityIndicator size="large" color="#00236f" />
              <Text style={{ color: "#757682", fontSize: 13, marginTop: 12 }}>
                Carregando galeria...
              </Text>
            </View>
          ) : isError ? (
            <View className="py-12 items-center justify-center">
              <MaterialIcons name="error-outline" size={42} color="#ba1a1a" />
              <Text style={{ color: "#ba1a1a", fontSize: 14, fontWeight: "bold", marginTop: 8 }}>
                Não foi possível carregar as conquistas
              </Text>
              <TouchableOpacity
                onPress={() => refetch()}
                className="mt-3 px-4 py-2 bg-primary rounded-xl"
              >
                <Text className="text-white font-semibold text-xs">Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {filteredAchievements.map((item) => (
                <AchievementCard
                  key={item.id}
                  item={item}
                  onPress={() => setSelectedAch(item)}
                />
              ))}
            </View>
          )}

          {/* Estado Vazio de Filtro */}
          {!isLoading && !isError && filteredAchievements.length === 0 && (
            <View className="py-12 items-center justify-center">
              <MaterialIcons name="military-tech" size={48} color="#c5c5d3" />
              <Text style={{ color: "#757682", fontSize: 13, textAlign: "center", marginTop: 8 }}>
                Nenhuma conquista encontrada neste filtro.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de Detalhes da Conquista */}
      <AchievementDetailModal
        achievement={selectedAch}
        visible={!!selectedAch}
        onClose={() => setSelectedAch(null)}
      />
    </SafeAreaView>
  );
}
