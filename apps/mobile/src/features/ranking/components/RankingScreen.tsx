import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { RankingPlayer, rankingService } from "../services/ranking.service";
import { MaterialIcons } from "@expo/vector-icons";

const TOPBAR_HEIGHT = 64;
const TABBAR_HEIGHT = 65;

export default function RankingScreen() {
  const [activeTab, setActiveTab] = useState<"global" | "semanal" | "mensal">(
    "global",
  );

  const { height } = useWindowDimensions();
  const scrollAreaHeight = height - TOPBAR_HEIGHT - TABBAR_HEIGHT;

  const {
    data: ranking,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["global-ranking"],
    queryFn: () => rankingService.getGlobalRanking(),
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#00236f" />
        <Text className="mt-4 text-on-surface font-title-md">
          Carregando ranking...
        </Text>
      </View>
    );
  }

  if (isError || !ranking) {
    return (
      <View className="flex-1 bg-surface justify-center items-center p-8">
        <MaterialIcons name="error" size={48} color="#ba1a1a" />
        <Text className="text-error mt-4 font-bold text-center">
          Não foi possível carregar o ranking
        </Text>
      </View>
    );
  }

  const rank1 = ranking.find((p) => p.position === 1) || null;
  const rank2 = ranking.find((p) => p.position === 2) || null;
  const rank3 = ranking.find((p) => p.position === 3) || null;

  const restOfRanking = ranking.slice(3);

  const renderItem = ({ item }: { item: RankingPlayer }) => {
    return (
      <View className="flex-row items-center bg-surface-container-lowest p-3 mb-2 rounded-xl border border-outline-variant/30 shadow-sm">
        <Text className="font-title-md font-bold w-8 text-center text-on-surface-variant">
          {item.position}
        </Text>

        {/* Círculo de Avatar Garantido com Estilo Inline */}
        <View
          style={{ width: 40, height: 40, borderRadius: 20 }}
          className="bg-primary-container justify-center items-center ml-2 overflow-hidden"
        >
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} className="w-full h-full" />
          ) : (
            <MaterialIcons name="person" size={24} color="#b6c4ff" />
          )}
        </View>

        <View className="flex-1 ml-4">
          <Text
            className="font-title-md font-bold text-on-surface"
            numberOfLines={1}
          >
            {item.name}
          </Text>
        </View>
        <View className="items-end">
          <Text className="font-label-lg font-bold text-primary">
            {item.points}
          </Text>
          <Text className="font-body-sm text-on-surface-variant text-[10px]">
            XP
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View className="items-center w-full">
      {/* Título */}
      <View className="items-center mb-4 mt-6">
        <MaterialIcons name="emoji-events" size={48} color="#fea619" />
        <Text className="font-headline-lg font-bold text-primary mt-2">
          Ranking Global
        </Text>
        <Text className="font-body-md text-on-surface-variant text-center mt-1">
          Os melhores jogadores da plataforma.
        </Text>
      </View>

      {/* Seletor de Abas */}
      <View className="w-full py-2">
        <View className="flex-row bg-surface-container-low p-1 rounded-xl">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg items-center ${activeTab === "global" ? "bg-surface shadow-sm" : ""}`}
            onPress={() => setActiveTab("global")}
          >
            <Text
              className={`font-label-lg text-xs ${activeTab === "global" ? "text-primary font-bold" : "text-on-surface-variant"}`}
            >
              Global
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg items-center ${activeTab === "semanal" ? "bg-surface shadow-sm" : ""}`}
            onPress={() => setActiveTab("semanal")}
          >
            <Text
              className={`font-label-lg text-xs ${activeTab === "semanal" ? "text-primary font-bold" : "text-on-surface-variant"}`}
            >
              Semanal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg items-center ${activeTab === "mensal" ? "bg-surface shadow-sm" : ""}`}
            onPress={() => setActiveTab("mensal")}
          >
            <Text
              className={`font-label-lg text-xs ${activeTab === "mensal" ? "text-primary font-bold" : "text-on-surface-variant"}`}
            >
              Mensal
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pódio em Três Colunas (Garantido por inline style) */}
      <View className="flex-row items-end justify-center gap-4 h-60 my-6 w-full">
        {/* Coluna do 2º Lugar */}
        {rank2 && (
          <View className="items-center w-24">
            <View className="relative">
              <View className="absolute -top-2 left-1/2 -translate-x-1/2 bg-surface-variant w-5 h-5 rounded-full items-center justify-center border-2 border-surface z-10">
                <Text className="text-on-surface-variant text-[9px] font-bold">
                  2
                </Text>
              </View>
              {/* Círculo do avatar fixo */}
              <View
                style={{ width: 64, height: 64, borderRadius: 32 }}
                className="border-4 border-surface-variant overflow-hidden shadow-md"
              >
                {rank2.avatar ? (
                  <Image
                    source={{ uri: rank2.avatar }}
                    className="w-full h-full"
                  />
                ) : (
                  <View className="w-full h-full bg-primary-container items-center justify-center">
                    <MaterialIcons name="person" size={24} color="#b6c4ff" />
                  </View>
                )}
              </View>
            </View>
            {/* Pilar com cor cinza explícita e altura fixa */}
            <View
              style={{
                height: 80,
                width: "100%",
                backgroundColor: "#e6e8ea",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}
              className="mt-2 items-center justify-center px-1"
            >
              <Text
                className="font-label-lg text-on-surface font-semibold text-center text-xs truncate w-full"
                numberOfLines={1}
              >
                {rank2.name}
              </Text>
              <Text className="font-label-sm text-on-surface-variant text-[10px] mt-1">
                {rank2.points} XP
              </Text>
            </View>
          </View>
        )}

        {/* Coluna do 1º Lugar (Mais Alta e Dourada) */}
        {rank1 && (
          <View className="items-center w-28 -translate-y-4">
            <View className="relative">
              <View className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-secondary-container w-7 h-7 rounded-full items-center justify-center border-2 border-surface z-20">
                <MaterialIcons
                  name="workspace-premium"
                  size={14}
                  color="#ffffff"
                />
              </View>
              {/* Círculo do avatar principal fixo */}
              <View
                style={{ width: 80, height: 80, borderRadius: 40 }}
                className="border-4 border-secondary-container overflow-hidden shadow-lg"
              >
                {rank1.avatar ? (
                  <Image
                    source={{ uri: rank1.avatar }}
                    className="w-full h-full"
                  />
                ) : (
                  <View className="w-full h-full bg-primary-container items-center justify-center">
                    <MaterialIcons name="person" size={32} color="#b6c4ff" />
                  </View>
                )}
              </View>
            </View>
            {/* Pilar dourado com bordas douradas e altura de 110 */}
            <View
              style={{
                height: 110,
                width: "100%",
                backgroundColor: "rgba(254, 166, 25, 0.2)",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                borderTopWidth: 2,
                borderLeftWidth: 2,
                borderRightWidth: 2,
                borderColor: "rgba(254, 166, 25, 0.3)",
              }}
              className="mt-2 items-center justify-center px-1"
            >
              <Text
                className="font-label-lg text-on-surface font-bold text-center text-sm truncate w-full"
                numberOfLines={1}
              >
                {rank1.name}
              </Text>
              <Text className="font-label-sm text-secondary font-bold text-xs mt-1">
                {rank1.points} XP
              </Text>
            </View>
          </View>
        )}

        {/* Coluna do 3º Lugar */}
        {rank3 && (
          <View className="items-center w-24">
            <View className="relative">
              <View className="absolute -top-2 left-1/2 -translate-x-1/2 bg-surface-tint/20 w-5 h-5 rounded-full items-center justify-center border-2 border-surface z-10">
                <Text className="text-surface-tint text-[9px] font-bold">
                  3
                </Text>
              </View>
              {/* Círculo do avatar fixo */}
              <View
                style={{ width: 64, height: 64, borderRadius: 32 }}
                className="border-4 border-surface-tint/20 overflow-hidden shadow-md"
              >
                {rank3.avatar ? (
                  <Image
                    source={{ uri: rank3.avatar }}
                    className="w-full h-full"
                  />
                ) : (
                  <View className="w-full h-full bg-primary-container items-center justify-center">
                    <MaterialIcons name="person" size={24} color="#b6c4ff" />
                  </View>
                )}
              </View>
            </View>
            {/* Pilar com cor cinza explícita e altura de 64 */}
            <View
              style={{
                height: 64,
                width: "100%",
                backgroundColor: "#e6e8ea",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}
              className="mt-2 items-center justify-center px-1"
            >
              <Text
                className="font-label-lg text-on-surface font-semibold text-center text-xs truncate w-full"
                numberOfLines={1}
              >
                {rank3.name}
              </Text>
              <Text className="font-label-sm text-on-surface-variant text-[10px] mt-1">
                {rank3.points} XP
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f9fb" }}>
      {/* TopAppBar Fixo no Topo */}
      <View
        style={{ height: TOPBAR_HEIGHT }}
        className="flex-row justify-between items-center px-5 w-full bg-surface border-b border-outline-variant/30"
      >
        {/* Leading: Avatar fictício */}
        <View className="relative flex-row items-center">
          <View className="w-10 h-10 rounded-full border-2 border-surface bg-surface-variant items-center justify-center">
            <MaterialIcons name="person" size={24} color="#00236f" />
          </View>
          <View
            style={{
              position: "absolute",
              bottom: -4,
              right: -8,
              backgroundColor: "#fea619",
              borderRadius: 999,
              borderWidth: 2,
              borderColor: "#f7f9fb",
              paddingHorizontal: 5,
              paddingVertical: 1,
              zIndex: 10,
            }}
          >
            <Text
              style={{
                color: "#684000",
                fontSize: 9,
                fontWeight: "bold",
                lineHeight: 13,
              }}
              numberOfLines={1}
            >
              Lvl 12
            </Text>
          </View>
        </View>

        {/* Headline/Brand */}
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="emoji-events" size={20} color="#00236f" />
          <Text className="text-primary font-bold text-lg tracking-tight">
            BibleQuest
          </Text>
        </View>

        {/* Trailing: Streak */}
        <TouchableOpacity className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant">
          <Text className="text-sm">🔥</Text>
          <Text className="text-primary font-bold text-sm">7 Dias</Text>
        </TouchableOpacity>
      </View>

      {/* Contêiner de Rolagem com Altura Restrita */}
      <View
        style={{ height: scrollAreaHeight }}
        className="flex-1 max-w-md mx-auto w-full relative"
      >
        <FlatList
          data={restOfRanking}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 120, // Garante que o último item da lista passe do rodapé flutuante
          }}
        />

        {/* Barra de Rodapé Fixa (Usuário Logado) */}
        <View className="absolute bottom-5 left-5 right-5 bg-primary rounded-2xl shadow-lg p-4 flex-row items-center justify-between z-50">
          <View className="flex-row items-center gap-4">
            <Text className="font-title-md text-white font-bold w-8 text-center">
              124º
            </Text>
            <View
              style={{ width: 40, height: 40, borderRadius: 20 }}
              className="border-2 border-white bg-primary-container items-center justify-center overflow-hidden"
            >
              <MaterialIcons name="person" size={20} color="#b6c4ff" />
            </View>
            <Text className="font-body-lg text-white font-semibold">Você</Text>
          </View>
          <Text className="font-label-lg text-white font-bold">1.250 XP</Text>
        </View>
      </View>
    </View>
  );
}
