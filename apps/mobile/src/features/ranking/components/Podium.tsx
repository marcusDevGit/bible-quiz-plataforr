import React from "react";
import { View, Text, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { RankingPlayer } from "../services/ranking.service";

interface PodiumProps {
    rank1: RankingPlayer | null;
    rank2: RankingPlayer | null;
    rank3: RankingPlayer | null;
}

export function Podium({ rank1, rank2, rank3 }: PodiumProps) {
    if (!rank1 && !rank2 && !rank3) {
        return null;
    }

    return (
        <View className="w-full flex-row items-end justify-center gap-3 pt-6 pb-2 px-2">
            {/* 2º Lugar - Esquerda (Prata) */}
            <View className="flex-1 max-w-[105px] items-center">
                {rank2 ? (
                    <>
                        <View className="relative items-center">
                            {/* Badge 2º Lugar */}
                            <View
                                style={{
                                    position: "absolute",
                                    top: -10,
                                    zIndex: 20,
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    backgroundColor: "#e0e3e5",
                                    borderWidth: 2,
                                    borderColor: "#f7f9fb",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Text
                                    style={{ color: "#444651", fontSize: 11, fontWeight: "bold" }}
                                >
                                    2
                                </Text>
                            </View>

                            {/* Avatar do 2º Lugar */}
                            <View
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 32,
                                    borderWidth: 3,
                                    borderColor: "#c5c5d3",
                                    overflow: "hidden",
                                    backgroundColor: "#e6e8ea",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                {rank2.avatar ? (
                                    <Image
                                        source={{ uri: rank2.avatar }}
                                        style={{ width: "100%", height: "100%" }}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <MaterialIcons name="person" size={28} color="#757682" />
                                )}
                            </View>
                        </View>

                        {/* Pilar do 2º Lugar */}
                        <View
                            style={{
                                width: "100%",
                                height: 80,
                                backgroundColor: "#e6e8ea",
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                                marginTop: 8,
                                alignItems: "center",
                                justifyContent: "center",
                                paddingHorizontal: 4,
                            }}
                        >
                            <Text
                                className="text-on-surface font-semibold text-xs text-center"
                                numberOfLines={1}
                            >
                                {rank2.name}
                            </Text>
                            <Text
                                style={{ color: "#444651", fontSize: 11, fontWeight: "600", marginTop: 2 }}
                            >
                                {rank2.points.toLocaleString("pt-BR")} XP
                            </Text>
                        </View>
                    </>
                ) : (
                    <View style={{ height: 80 }} />
                )}
            </View>

            {/* 1º Lugar - Centro (Ouro e Elevado) */}
            <View className="flex-1 max-w-[120px] items-center -translate-y-3">
                {rank1 ? (
                    <>
                        <View className="relative items-center">
                            {/* Badge 1º Lugar com Coroa / Medalha Dourada */}
                            <View
                                style={{
                                    position: "absolute",
                                    top: -12,
                                    zIndex: 20,
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    backgroundColor: "#fea619",
                                    borderWidth: 2,
                                    borderColor: "#f7f9fb",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    shadowColor: "#fea619",
                                    shadowOpacity: 0.4,
                                    shadowRadius: 6,
                                    elevation: 5,
                                }}
                            >
                                <MaterialIcons name="workspace-premium" size={16} color="#ffffff" />
                            </View>

                            {/* Avatar do 1º Lugar */}
                            <View
                                style={{
                                    width: 76,
                                    height: 76,
                                    borderRadius: 38,
                                    borderWidth: 4,
                                    borderColor: "#fea619",
                                    overflow: "hidden",
                                    backgroundColor: "rgba(254, 166, 25, 0.15)",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                {rank1.avatar ? (
                                    <Image
                                        source={{ uri: rank1.avatar }}
                                        style={{ width: "100%", height: "100%" }}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <MaterialIcons name="person" size={36} color="#855300" />
                                )}
                            </View>
                        </View>

                        {/* Pilar do 1º Lugar */}
                        <View
                            style={{
                                width: "100%",
                                height: 112,
                                backgroundColor: "rgba(254, 166, 25, 0.18)",
                                borderTopLeftRadius: 18,
                                borderTopRightRadius: 18,
                                borderTopWidth: 2,
                                borderLeftWidth: 1.5,
                                borderRightWidth: 1.5,
                                borderColor: "rgba(254, 166, 25, 0.45)",
                                marginTop: 8,
                                alignItems: "center",
                                justifyContent: "center",
                                paddingHorizontal: 4,
                            }}
                        >
                            <Text
                                className="text-on-surface font-bold text-sm text-center"
                                numberOfLines={1}
                            >
                                {rank1.name}
                            </Text>
                            <Text
                                style={{ color: "#855300", fontSize: 12, fontWeight: "700", marginTop: 2 }}
                            >
                                {rank1.points.toLocaleString("pt-BR")} XP
                            </Text>
                        </View>
                    </>
                ) : (
                    <View style={{ height: 112 }} />
                )}
            </View>

            {/* 3º Lugar - Direita (Bronze) */}
            <View className="flex-1 max-w-[105px] items-center">
                {rank3 ? (
                    <>
                        <View className="relative items-center">
                            {/* Badge 3º Lugar */}
                            <View
                                style={{
                                    position: "absolute",
                                    top: -10,
                                    zIndex: 20,
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    backgroundColor: "rgba(64, 89, 170, 0.2)",
                                    borderWidth: 2,
                                    borderColor: "#f7f9fb",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Text
                                    style={{ color: "#4059aa", fontSize: 11, fontWeight: "bold" }}
                                >
                                    3
                                </Text>
                            </View>

                            {/* Avatar do 3º Lugar */}
                            <View
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 32,
                                    borderWidth: 3,
                                    borderColor: "rgba(64, 89, 170, 0.3)",
                                    overflow: "hidden",
                                    backgroundColor: "#e6e8ea",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                {rank3.avatar ? (
                                    <Image
                                        source={{ uri: rank3.avatar }}
                                        style={{ width: "100%", height: "100%" }}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <MaterialIcons name="person" size={28} color="#757682" />
                                )}
                            </View>
                        </View>

                        {/* Pilar do 3º Lugar */}
                        <View
                            style={{
                                width: "100%",
                                height: 64,
                                backgroundColor: "#e6e8ea",
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                                marginTop: 8,
                                alignItems: "center",
                                justifyContent: "center",
                                paddingHorizontal: 4,
                            }}
                        >
                            <Text
                                className="text-on-surface font-semibold text-xs text-center"
                                numberOfLines={1}
                            >
                                {rank3.name}
                            </Text>
                            <Text
                                style={{ color: "#444651", fontSize: 11, fontWeight: "600", marginTop: 2 }}
                            >
                                {rank3.points.toLocaleString("pt-BR")} XP
                            </Text>
                        </View>
                    </>
                ) : (
                    <View style={{ height: 64 }} />
                )}
            </View>
        </View>
    );
}
