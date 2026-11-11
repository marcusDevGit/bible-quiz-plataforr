import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import { RankingPlayer, rankingService } from "../services/ranking.service";
import { authService } from "@/features/auth/services/auth.service";
import { Podium } from "./Podium";



export default function RankingScreen() {
  const [activeTab, setActiveTab] = useState<"global" | "semanal" | "mensal">(
    "global",
  );

  const {
    data: ranking = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["ranking", activeTab],
    queryFn: () => {
      if (activeTab === "semanal") return rankingService.getWeeklyRanking();
      if (activeTab === "mensal") return rankingService.getMonthlyRanking();
      return rankingService.getGlobalRanking();
    },
  });

  const { data: profileData } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: () => authService.getProfile(),
  });
  const loggedUser = profileData?.user;
  const loggedUserRank = ranking?.find((p) => p.id === loggedUser?.id);
  const userPoints = loggedUser?.points ?? loggedUserRank?.points ?? 0;
  const currentLevel = loggedUser?.level ?? Math.floor(userPoints / 200) + 1;


  const rank1 = ranking.find((p) => p.position === 1) || null;
  const rank2 = ranking.find((p) => p.position === 2) || null;
  const rank3 = ranking.find((p) => p.position === 3) || null;
  const restOfRanking = ranking.filter((p) => p.position > 3);

  const renderItem = ({ item }: { item: RankingPlayer }) => {
    const isLoggedUser = item.id === loggedUser?.id;

    return (
      <View
        style={{
          backgroundColor: isLoggedUser ? "rgba(0, 35, 111, 0.06)" : "#ffffff",
          borderColor: isLoggedUser ? "#00236f" : "#e6e8ea",
          borderWidth: isLoggedUser ? 2 : 1
        }}
        className="flex-row items-center justify-between p-3.5 mb-2.5 rounded-xl shadow-sm">
        <View className="flex-row items-center flex-1 mr-3">
          <Text
            style={{ width: 28, color: "#444651", fontSize: 14, fontWeight: "700" }}
            className="text-center">
            {item.position}
          </Text>

          {/* Círculo de Avatar Garantido com Estilo Inline */}
          <View
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#eceef0", overflow: "hidden", alignItems: "center", justifyContent: "center", marginLeft: 8 }}
          >
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            ) : (
              <Text style={{ color: "#00236f", fontWeight: "700", fontSize: 16 }}>
                {item.name ? item.name.charAt(0).toUpperCase() : "J"}
              </Text>
            )}
          </View>

          <View className="flex-1 ml-4">
            <Text
              className="text-on-surface font-semibold text-sm"
              numberOfLines={1}
            >
              {isLoggedUser ? `${item.name} (Você)` : item.name}
            </Text>
          </View>
        </View>

        <Text style={{ color: "#00236f", fontSize: 14, fontWeight: "700" }}>
          {item.points.toLocaleString("pt-BR")} XP
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View className=" w-full">
      <View className="pt-3 pb-2">
        <View style={{ backgroundColor: "#f2f4f6" }} className="flex-row p-1 rounded-xl">
          <TouchableOpacity style={{
            backgroundColor: activeTab === "global" ? "#ffffff" : "transparent",
            elevation: activeTab === "global" ? 2 : 0
          }}
            className="flex-1 py-2 rounded-lg items-center justify-center"
            onPress={() => setActiveTab("global")}
            activeOpacity={0.8}
          >
            <Text
              style={{ color: activeTab === "global" ? "#00236f" : "#444651", fontWeight: activeTab === "global" ? "700" : "500", fontSize: 14 }}
            >Global</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: activeTab === "semanal" ? "#ffffff" : "transparent",
              elevation: activeTab === "semanal" ? 2 : 0,
            }}
            className="flex-1 py-2 rounded-lg items-center justify-center"
            onPress={() => setActiveTab("semanal")}
            activeOpacity={0.8}
          >
            <Text
              style={{
                color: activeTab === "semanal" ? "#00236f" : "#444651",
                fontWeight: activeTab === "semanal" ? "700" : "500",
                fontSize: 13,
              }}
            >
              Semanal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: activeTab === "mensal" ? "#ffffff" : "transparent",
              elevation: activeTab === "mensal" ? 2 : 0,
            }}
            className="flex-1 py-2 rounded-lg items-center justify-center"
            onPress={() => setActiveTab("mensal")}
            activeOpacity={0.8}
          >
            <Text
              style={{
                color: activeTab === "mensal" ? "#00236f" : "#444651",
                fontWeight: activeTab === "mensal" ? "700" : "500",
                fontSize: 13,
              }}
            >
              Mensal
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pódio em Três Colunas (Garantido por inline style) */}
      <Podium rank1={rank1} rank2={rank2} rank3={rank3} />

      {/* Título sutil da lista */}
      {restOfRanking.length > 0 && (
        <View className="pt-4 pb-2 px-1">
          <Text
            style={{ color: "#757682", fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            Classificação Geral
          </Text>
        </View>
      )}
    </View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fb" }}>
      {/* TopAppBar Fixo */}
      <View
        style={{ height: 60, borderBottomWidth: 1, borderBottomColor: "#e6e8ea", backgroundColor: "#ffffff" }}
        className="flex-row items-center justify-between px-5 w-full"
      >
        {/* Leading: Avatar do Usuário com Nível */}
        <View className="relative flex-row items-center">
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
              justifyContent: "center",
            }}
          >
            {loggedUser?.avatar ? (
              <Image
                source={{ uri: loggedUser.avatar }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <MaterialIcons name="person" size={22} color="#00236f" />
            )}
          </View>
          <View
            style={{
              position: "absolute",
              bottom: -2,
              right: -6,
              backgroundColor: "#fea619",
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: "#ffffff",
              paddingHorizontal: 4,
              paddingVertical: 1,
            }}
          >
            <Text style={{ color: "#684000", fontSize: 9, fontWeight: "bold" }}>
              Lvl {currentLevel}
            </Text>
          </View>
        </View>
        {/* Título Central da Marca */}
        <View className="flex-row items-center gap-1.5">
          <MaterialIcons name="emoji-events" size={22} color="#00236f" />
          <Text
            style={{ color: "#00236f", fontSize: 18, fontWeight: "bold", letterSpacing: -0.3 }}
          >
            BibleQuest
          </Text>
        </View>
        {/* Trailing: Streak de Ofensiva */}
        <View
          style={{
            backgroundColor: "#f2f4f6",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e6e8ea",
          }}
          className="flex-row items-center gap-1"
        >
          <Text style={{ fontSize: 12 }}>🔥</Text>
          <Text style={{ color: "#00236f", fontSize: 12, fontWeight: "bold" }}>
            {loggedUser?.currentStreak || 1} Dias
          </Text>
        </View>
      </View>
      {/* Conteúdo Central Responsivo (max-w-xl para Tablets) */}
      <View className="flex-1 w-full max-w-xl mx-auto px-4 relative">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#00236f" />
            <Text style={{ color: "#444651", fontSize: 14, marginTop: 12, fontWeight: "500" }}>
              Carregando classificação...
            </Text>
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center p-6">
            <MaterialIcons name="error-outline" size={48} color="#ba1a1a" />
            <Text style={{ color: "#ba1a1a", fontSize: 15, fontWeight: "bold", marginTop: 8 }}>
              Não foi possível carregar o ranking
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="mt-4 px-4 py-2 bg-primary rounded-xl"
            >
              <Text className="text-white font-semibold text-sm">Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={restOfRanking}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                colors={["#00236f"]}
              />
            }
            contentContainerStyle={{
              paddingTop: 8,
              paddingBottom: 100, // Espaço extra para o card flutuante do rodapé
            }}
            ListEmptyComponent={
              ranking.length <= 3 ? (
                <View className="py-8 items-center justify-center">
                  <Text style={{ color: "#757682", fontSize: 13, textAlign: "center" }}>
                    Nenhum jogador adicional nesta categoria ainda.
                  </Text>
                </View>
              ) : null
            }
          />
        )}
        {/* Barra Fixa Flutuante do Usuário Logado */}
        {loggedUser && (
          <View
            style={{
              position: "absolute",
              bottom: 12,
              left: 16,
              right: 16,
              zIndex: 50,
            }}
          >
            <View
              style={{
                backgroundColor: "#00236f",
                borderRadius: 16,
                paddingVertical: 12,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                shadowColor: "#00236f",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 10,
                elevation: 8,
              }}
            >
              <View className="flex-row items-center flex-1 mr-3">
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 15,
                    fontWeight: "bold",
                    width: 36,
                    textAlign: "center",
                  }}
                >
                  {loggedUserRank ? `${loggedUserRank.position}º` : "-"}
                </Text>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderWidth: 2,
                    borderColor: "#ffffff",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 6,
                  }}
                >
                  {loggedUser.avatar ? (
                    <Image
                      source={{ uri: loggedUser.avatar }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <MaterialIcons name="person" size={20} color="#ffffff" />
                  )}
                </View>
                <Text
                  style={{ color: "#ffffff", fontSize: 14, fontWeight: "600", marginLeft: 10 }}
                  numberOfLines={1}
                >
                  Você
                </Text>
              </View>
              <Text
                style={{ color: "#ffffff", fontSize: 14, fontWeight: "bold" }}
              >
                {loggedUserRank ? `${loggedUserRank.points.toLocaleString("pt-BR")} XP` : "0 XP"}
              </Text>
            </View>
          </View>
        )}
      </View>

    </SafeAreaView>
  );
}
