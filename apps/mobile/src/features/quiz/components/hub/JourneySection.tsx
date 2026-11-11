import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export function JourneySection() {
    const router = useRouter();

    return (
        <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                    <MaterialIcons name="explore" size={20} color="#00236f" />
                    <Text style={{ color: "#191c1e" }} className="font-bold text-base">
                        Jornada pelas Escrituras
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() =>
                        router.push({
                            pathname: "/quiz",
                            params: { mode: "journey", categoryName: "Jornada pelas Escrituras" },
                        })
                    }
                    className="flex-row items-center"
                >
                    <Text style={{ color: "#00236f", fontSize: 12, fontWeight: "600" }}>Ver Trilha</Text>
                    <MaterialIcons name="chevron-right" size={16} color="#00236f" />
                </TouchableOpacity>
            </View>

            {/* Barra Canônica */}
            <View style={{ backgroundColor: "#ffffff", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#e6e8ea", marginBottom: 12 }} className="shadow-sm">
                <View className="flex-row justify-between items-center mb-1.5">
                    <Text style={{ color: "#757682", fontSize: 12, fontWeight: "500" }}>Progresso Geral Canônico</Text>
                    <Text style={{ color: "#00236f", fontSize: 12, fontWeight: "bold" }}>38% Concluído</Text>
                </View>
                <View style={{ height: 9, backgroundColor: "#eceef0", borderRadius: 5, overflow: "hidden", marginBottom: 6 }}>
                    <View style={{ height: "100%", width: "38%", backgroundColor: "#00236f", borderRadius: 5 }} />
                </View>
                <View className="flex-row justify-between">
                    <Text style={{ color: "#757682", fontSize: 10 }}>Gênesis (Criação)</Text>
                    <Text style={{ color: "#757682", fontSize: 10 }}>Apocalipse (Glória)</Text>
                </View>
            </View>

            {/* Livros em andamento */}
            <View className="gap-3">
                {/* Mateus */}
                <View style={{ backgroundColor: "#ffffff", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#e6e8ea" }} className="shadow-sm">
                    <View className="flex-row justify-between items-start mb-3">
                        <View style={{ flex: 1, paddingRight: 8 }}>
                            <View style={{ alignSelf: "flex-start", backgroundColor: "#dce1ff", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 6 }}>
                                <Text style={{ color: "#264191", fontSize: 10, fontWeight: "bold" }}>Novo Testamento</Text>
                            </View>
                            <Text className="text-base font-bold text-on-surface">Evangelho de Mateus</Text>
                            <Text style={{ color: "#757682", fontSize: 12, marginTop: 2 }}>O Evangelho do Reino • Nível 4/10</Text>
                        </View>
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#f2f4f6", alignItems: "center", justifyContent: "center" }}>
                            <MaterialIcons name="auto-stories" size={22} color="#00236f" />
                        </View>
                    </View>
                    <View className="mb-3">
                        <View className="flex-row justify-between mb-1">
                            <Text style={{ color: "#757682", fontSize: 11 }}>Progresso</Text>
                            <Text style={{ color: "#00236f", fontWeight: "bold", fontSize: 11 }}>40%</Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: "#eceef0", borderRadius: 3, overflow: "hidden" }}>
                            <View style={{ height: "100%", width: "40%", backgroundColor: "#00236f", borderRadius: 3 }} />
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() =>
                            router.push({
                                pathname: "/quiz",
                                params: { mode: "journey", categoryName: "Evangelho de Mateus" },
                            })
                        }
                        activeOpacity={0.8}
                        style={{ backgroundColor: "#f2f4f6", paddingVertical: 10, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 }}
                    >
                        <MaterialIcons name="play-arrow" size={18} color="#00236f" />
                        <Text style={{ color: "#00236f", fontWeight: "bold", fontSize: 13 }}>Continuar Nível 5</Text>
                    </TouchableOpacity>
                </View>

                {/* Gênesis */}
                <View style={{ backgroundColor: "#ffffff", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#e6e8ea" }} className="shadow-sm">
                    <View className="flex-row justify-between items-start mb-3">
                        <View style={{ flex: 1, paddingRight: 8 }}>
                            <View style={{ alignSelf: "flex-start", backgroundColor: "#ffddb8", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 6 }}>
                                <Text style={{ color: "#653e00", fontSize: 10, fontWeight: "bold" }}>Antigo Testamento</Text>
                            </View>
                            <Text className="text-base font-bold text-on-surface">Gênesis: Origens</Text>
                            <Text style={{ color: "#757682", fontSize: 12, marginTop: 2 }}>A Criação & Patriarcas • Nível 8/10</Text>
                        </View>
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#f2f4f6", alignItems: "center", justifyContent: "center" }}>
                            <MaterialIcons name="history-edu" size={22} color="#855300" />
                        </View>
                    </View>
                    <View className="mb-3">
                        <View className="flex-row justify-between mb-1">
                            <Text style={{ color: "#757682", fontSize: 11 }}>Progresso</Text>
                            <Text style={{ color: "#855300", fontWeight: "bold", fontSize: 11 }}>80%</Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: "#eceef0", borderRadius: 3, overflow: "hidden" }}>
                            <View style={{ height: "100%", width: "80%", backgroundColor: "#fea619", borderRadius: 3 }} />
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() =>
                            router.push({
                                pathname: "/quiz",
                                params: { mode: "journey", categoryName: "Gênesis: Origens" },
                            })
                        }
                        activeOpacity={0.8}
                        style={{ backgroundColor: "#ffddb8", paddingVertical: 10, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 }}
                    >
                        <MaterialIcons name="play-arrow" size={18} color="#653e00" />
                        <Text style={{ color: "#653e00", fontWeight: "bold", fontSize: 13 }}>Continuar Nível 9</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
