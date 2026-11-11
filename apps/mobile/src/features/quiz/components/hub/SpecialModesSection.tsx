import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export function SpecialModesSection() {
    const router = useRouter();

    return (
        <View className="mb-4">
            <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="sports-esports" size={20} color="#fea619" />
                <Text style={{ color: "#191c1e" }} className="font-bold text-base">
                    Modos Especiais de Treino
                </Text>
            </View>

            <View className="gap-3">
                {/* Modo Sobrevivência */}
                <TouchableOpacity
                    onPress={() =>
                        router.push({
                            pathname: "/quiz",
                            params: { mode: "survival", categoryName: "Modo Sobrevivência" },
                        })
                    }
                    activeOpacity={0.85}
                    style={{
                        backgroundColor: "#00236f",
                        borderRadius: 18,
                        padding: 16,
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <View style={{ position: "absolute", right: -10, bottom: -10, opacity: 0.1 }}>
                        <MaterialIcons name="shield" size={90} color="#ffffff" />
                    </View>
                    <View className="flex-row items-center gap-3">
                        <View style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }} className="w-12 h-12 rounded-xl items-center justify-center">
                            <MaterialIcons name="shield" size={24} color="#fea619" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text className="text-white font-bold text-base">Sobrevivência Bíblica</Text>
                            <Text style={{ color: "#b6c4ff", fontSize: 12 }}>
                                1 única vida. Quantas perguntas você acerta?
                            </Text>
                        </View>
                        <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
                    </View>
                </TouchableOpacity>

                {/* Modo Arena 1v1 */}
                <TouchableOpacity
                    onPress={() => router.push("/arena")}
                    activeOpacity={0.85}
                    style={{
                        backgroundColor: "#ffffff",
                        borderColor: "#fea619",
                        borderWidth: 1.5,
                        borderRadius: 18,
                        padding: 16,
                    }}
                    className="shadow-sm"
                >
                    <View className="flex-row items-center gap-3">
                        <View style={{ backgroundColor: "#ffddb8" }} className="w-12 h-12 rounded-xl items-center justify-center">
                            <MaterialIcons name="sports-esports" size={24} color="#855300" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text className="font-bold text-base text-on-surface">Arena Multiplayer 1v1</Text>
                            <Text style={{ color: "#757682", fontSize: 12 }}>
                                Batalhe em tempo real com outro irmão
                            </Text>
                        </View>
                        <MaterialIcons name="arrow-forward" size={20} color="#855300" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}
