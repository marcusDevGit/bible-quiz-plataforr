import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { authService } from "~/src/features/auth/services/auth.service";
import { rankingService } from "~/src/features/ranking/services/ranking.service";
import { categoryService, CategoryItem } from "~/src/features/categories/services/category.service";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";

const FALLBACK_CATEGORIES: CategoryItem[] = [
  {
    id: "1", name: "Antigo Testamento", _count: { questions: 24 },
    createdAt: ""
  },
  {
    id: "2", name: "Novo Testamento", _count: { questions: 18 },
    createdAt: ""
  },
  {
    id: "3", name: "Personagens", _count: { questions: 12 },
    createdAt: ""
  },
  {
    id: "4", name: "Salmos & Sabedoria", _count: { questions: 15 },
    createdAt: ""
  },
];


export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    data: profileData,
    refetch: refetchProfile,
    isRefetching: isRefetchingProfile,
  } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: () => authService.getProfile(),
  });
  const loggedUser = profileData?.user

  const {
    data: ranking = [],
    refetch: refetchRanking,
    isRefetching: isRefetchingRanking,
  } = useQuery({
    queryKey: ["ranking"],
    queryFn: () => rankingService.getGlobalRanking(),
  })
  const loggedUserRank = ranking.find((p) => p.id === loggedUser?.id)

  const {
    data: apiCategories = [],
    refetch: refetchCategories,
    isRefetching: isRefetchingCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories()
  })

  const categories = apiCategories.length > 0 ? apiCategories : FALLBACK_CATEGORIES

  // Cálculo gamificado de Nível e Progresso de XP
  const userPoints = loggedUserRank?.points ?? 0;
  const XP_PER_LEVEL = 200;
  const currentLevel = Math.floor(userPoints / XP_PER_LEVEL) + 1;
  const nextLevel = currentLevel + 1;
  const currentXPInLevel = userPoints % XP_PER_LEVEL;
  const progressPercent = Math.min(
    100,
    Math.round((currentXPInLevel / XP_PER_LEVEL) * 100),
  );
  const isRefreshing =
    isRefetchingProfile || isRefetchingRanking || isRefetchingCategories;
  const handleRefresh = () => {
    refetchProfile();
    refetchRanking();
    refetchCategories();
  };
  const firstName = loggedUser?.name ? loggedUser.name.split(" ")[0] : "Jogador";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fb" }}>
      {/* TopAppBar — FIXO, fora do ScrollView */}
      <View
        style={{ height: 60, borderBottomWidth: 1, borderBottomColor: "#e6e8ea", backgroundColor: "#ffffff" }}
        className="flex-row justify-between items-center px-5 w-full"
      >
        {/* Leading: Avatar & Level */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/profile")}
          className="relative flex-row items-center"
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#eceef0",
              overflow: "hidden",
              borderWidth: 1.5,
              borderColor: "#c5c5d3",
              alignItems: "center",
              justifyContent: "center"
            }}>{loggedUser?.avatar ? (
              <Image
                source={{ uri: loggedUser.avatar }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (<MaterialIcons name="person" size={22} color="#00236f" />
            )}
          </View>
          <View
            style={{
              position: "absolute",
              bottom: -4,
              right: -8,
              backgroundColor: "#fea619",
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: "#ffffff",
              paddingHorizontal: 4,
              paddingVertical: 1,
            }}
          >
            <Text
              style={{
                color: "#684000",
                fontSize: 9,
                fontWeight: "bold",
              }}
            >
              Lvl {currentLevel}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Headline/Brand */}
        <View className="flex-row items-center gap-2">
          <FontAwesome5 name="bible" size={18} color="#00236f" />
          <Text
            style={{
              color: "#00236f",
              fontSize: 18,
              fontWeight: "bold",
              letterSpacing: -0.3
            }}
          >
            BibleQuest
          </Text>
        </View>

        {/* Trailing: Streak Action */}
        <View
          style={{
            backgroundColor: "#f2f4f6",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e6e8ea",
          }}
          className="flex-row items-center gap-1 ">
          <Text style={{ fontSize: 12 }}>🔥</Text>
          <Text style={{ color: "#00236f", fontSize: 12, fontWeight: "bold" }}>{loggedUser?.currentStreak || 1} Dias</Text>
        </View>
      </View>

      {/* Main Content Canvas — ScrollView com altura calculada */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#00236f"]} />
        }
      >
        <View className="w-full max-w-xl mx-auto px-5">
          {/* Hero Section */}
          <View className="mb-5">
            <Text className="text-3xl font-bold text-on-surface mb-2">
              Olá, {firstName}! 👋
            </Text>
            <Text
              style={{ color: "#757682", fontSize: 14, marginTop: 2 }}            >
              Pronto para o desafio de hoje?
            </Text>
          </View>

          {/* Hero CTA Card */}
          <View
            style={{
              backgroundColor: "#00236f",
              borderRadius: 24,
              padding: 22,
              position: "relative",
              overflow: "hidden",
              shadowColor: "#00236f",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 6,
              marginBottom: 20,
            }}
          >
            {/* Decorative Background Element */}
            <View
              style={{
                position: "absolute",
                right: -20,
                top: -20,
                opacity: 0.12,
              }}
            >
              <MaterialIcons name="menu-book" size={150} color="#ffffff" />
            </View>
            <View style={{ zIndex: 10 }}>
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "rgba(255, 255, 255, 0.18)",
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 10,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                  }}
                >
                  Continuar Lendo
                </Text>
              </View>

              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 20,
                  fontWeight: "bold",
                  marginBottom: 4,
                }}
              >
                Evangelho de João
              </Text>

              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.75)",
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                Aprofunde sua fé na caminhada cristã
              </Text>
              {/* Barra de Progresso com Cor Dourada */}
              <View style={{ marginBottom: 18 }}>
                <View className="flex-row justify-between mb-1.5">
                  <Text style={{ color: "#ffffff", fontSize: 11, opacity: 0.9 }}>
                    Progresso Geral
                  </Text>
                  <Text
                    style={{
                      color: "#fea619",
                      fontSize: 11,
                      fontWeight: "bold",
                    }}
                  >
                    {progressPercent}%
                  </Text>
                </View>
                <View
                  style={{
                    height: 8,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      width: `${progressPercent}%`,
                      backgroundColor: "#fea619",
                      borderRadius: 4,
                    }}
                  />
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                onPress={() => router.push("/quiz")}
                activeOpacity={0.85}
                style={{
                  backgroundColor: "#fea619",
                  borderRadius: 14,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    color: "#684000",
                    fontWeight: "bold",
                    fontSize: 14,
                  }}
                >
                  Retomar Quiz
                </Text>
                <MaterialIcons name="play-arrow" size={20} color="#684000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions Bento Grid */}
          <View className="flex-row gap-4 mb-5">
            {/* Action 1 */}
            <TouchableOpacity
              onPress={() => router.push("/quiz")}
              activeOpacity={0.8}
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#e6e8ea",
                borderWidth: 1,
              }}
              className="flex-1 rounded-2xl p-4 items-center justify-center shadow-sm"
            >
              <View
                style={{ backgroundColor: "rgba(0, 35, 111, 0.08)" }}
                className="w-12 h-12 rounded-full items-center justify-center mb-2"
              >
                <MaterialIcons
                  name="calendar-today"
                  size={24}
                  color="#00236f"
                />
              </View>
              <Text className="text-on-surface font-bold text-sm text-center">
                Quiz Diário
              </Text>
              <Text className="font-semibold text-xs mt-0.5">
                +50 XP
              </Text>
            </TouchableOpacity>

            {/* Action 2 */}
            <TouchableOpacity
              onPress={() => router.push("/arena")}
              activeOpacity={0.8}
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#e6e8ea",
                borderWidth: 1,
              }}
              className="flex-1  rounded-2xl p-4 shadow-sm items-center justify-center relative"
            >
              <View
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#ba1a1a",
                }} />

              <View
                style={{ backgroundColor: "rgba(254, 166, 25, 0.18)" }}
                className="w-12 h-12 rounded-full items-center justify-center mb-2">
                <MaterialIcons
                  name="sports-esports"
                  size={24}
                  color="#fea619"
                />
              </View>
              <Text className="text-on-surface font-bold text-sm text-center">
                Desafio Multiplayer
              </Text>
              <Text
                style={{ color: "#757682" }}
                className="text-xs mt-0.5"
              >
                Arena Ativa
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: "#e6e8ea",
              shadowColor: "#000",
              shadowOpacity: 0.03,
              shadowRadius: 8,
              elevation: 2,
              marginBottom: 20,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="emoji-events" size={20} color="#fea619" />
                <Text className="font-bold text-sm text-on-surface">
                  Seu Desempenho
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/ranking")}>
                <Text
                  style={{ color: "#00236f", fontSize: 12, fontWeight: "600" }}
                >
                  Ver Tabela
                </Text>
              </TouchableOpacity>
            </View>
            {/* Posição no Ranking Global */}
            <View
              style={{ backgroundColor: "#f2f4f6" }}
              className="flex-row items-center justify-between p-3 rounded-xl mb-3"
            >
              <View className="flex-row items-center gap-3">
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "#e0e3e5",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#00236f",
                      fontWeight: "bold",
                      fontSize: 13,
                    }}
                  >
                    #{loggedUserRank ? loggedUserRank.position : "-"}
                  </Text>
                </View>
                <View>
                  <Text className="font-semibold text-xs text-on-surface">
                    Classificação Global
                  </Text>
                  <Text style={{ color: "#757682", fontSize: 11 }}>
                    {loggedUserRank ? `${loggedUserRank.points} XP acumulados` : "Jogue para ranquear"}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="trending-up" size={20} color="#27c38a" />
            </View>
            {/* Barra de Progresso de XP / Nível */}
            <View className="px-1">
              <View className="flex-row justify-between mb-1.5">
                <Text style={{ color: "#444651", fontSize: 11, fontWeight: "600" }}>
                  Lvl {currentLevel}
                </Text>
                <Text style={{ color: "#757682", fontSize: 11 }}>
                  {currentXPInLevel} / {XP_PER_LEVEL} XP
                </Text>
                <Text style={{ color: "#444651", fontSize: 11, fontWeight: "600" }}>
                  Lvl {nextLevel}
                </Text>
              </View>
              <View
                style={{
                  height: 10,
                  backgroundColor: "#eceef0",
                  borderRadius: 5,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${progressPercent}%`,
                    backgroundColor: "#00236f",
                    borderRadius: 5,
                  }}
                />
              </View>
            </View>
          </View>
          {/* 5. Carrossel Horizontal de Categorias */}
          <View className="mb-2">
            <View className="flex-row items-center justify-between mb-3 px-1">
              <Text className="font-bold text-base text-on-surface">
                Categorias Bíblicas
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/explore")}
                className="flex-row items-center"
              >
                <Text
                  style={{ color: "#00236f", fontSize: 12, fontWeight: "600" }}
                >
                  Ver Todas
                </Text>
                <MaterialIcons name="chevron-right" size={16} color="#00236f" />
              </TouchableOpacity>
            </View>
            {/* Scroll Horizontal */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingBottom: 6 }}
            >
              {categories.map((cat, index) => {
                const colors = [
                  { bg: "#E6F0FF", icon: "#00236f", iconName: "auto-stories" },
                  { bg: "#FFF5E6", icon: "#855300", iconName: "menu-book" },
                  { bg: "#E6FFE6", icon: "#008A00", iconName: "groups" },
                  { bg: "#F3E8FF", icon: "#6B21A8", iconName: "auto-awesome" },
                ];
                const theme = colors[index % colors.length];
                return (
                  <TouchableOpacity
                    key={cat.id || index}
                    onPress={() =>
                      router.push({
                        pathname: "/quiz",
                        params: {
                          categoryId: cat.id,
                          categoryName: cat.name,
                        },
                      })
                    }
                    activeOpacity={0.8}
                    style={{
                      width: 170,
                      backgroundColor: "#ffffff",
                      borderRadius: 18,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: "#e6e8ea",
                      shadowColor: "#000",
                      shadowOpacity: 0.03,
                      shadowRadius: 6,
                      elevation: 2,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: theme.bg,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                      }}
                    >
                      <MaterialIcons
                        name={theme.iconName as any}
                        size={22}
                        color={theme.icon}
                      />
                    </View>
                    <Text
                      className="font-bold text-sm text-on-surface mb-1"
                      numberOfLines={1}
                    >
                      {cat.name}
                    </Text>
                    <Text
                      style={{ color: "#757682", fontSize: 11 }}
                    >
                      {cat._count?.questions ?? 10} Quizzes disponíveis
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView >
  );
}
