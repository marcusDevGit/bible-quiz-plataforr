import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export function DailyChallengeCard() {
    const router = useRouter();
    const [timeRemaining, setTimeRemaining] = useState("06:42:15");

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(23, 59, 59, 999);
            const diffMs = midnight.getTime() - now.getTime();
            if (diffMs <= 0) {
                setTimeRemaining("00:00:00");
                return;
            }
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
            const pad = (n: number) => n.toString().padStart(2, "0");
            setTimeRemaining(`${pad(hours)}:${pad(mins)}:${pad(secs)}`);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <View
            style={{
                backgroundColor: "#00236f",
                borderRadius: 24,
                padding: 20,
                position: "relative",
                overflow: "hidden",
                marginBottom: 24,
                elevation: 6,
            }}
        >
            <View style={{ position: "absolute", right: -10, bottom: -15, opacity: 0.12 }}>
                <MaterialIcons name="water" size={130} color="#ffffff" />
            </View>
            <View style={{ zIndex: 10 }}>
                <View className="flex-row items-center justify-between mb-3">
                    <View style={{ backgroundColor: "#fea619", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ color: "#684000", fontSize: 11, fontWeight: "bold" }}>
                            🔥 DESAFIO DO DIA
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <MaterialIcons name="hourglass-top" size={14} color="#90a8ff" />
                        <Text style={{ color: "#90a8ff", fontSize: 11, fontWeight: "bold" }}>
                            EXPIRA EM {timeRemaining}
                        </Text>
                    </View>
                </View>

                <Text style={{ color: "#ffffff", fontSize: 19, fontWeight: "bold", marginBottom: 4 }}>
                    Os Milagres no Mar da Galileia
                </Text>
                <Text style={{ color: "#b6c4ff", fontSize: 13, lineHeight: 18, marginBottom: 14 }}>
                    Tempestade acalmada, caminhada sobre as águas e a pesca milagrosa.
                </Text>

                <View className="flex-row items-center gap-2 mb-4">
                    <View style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }} className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg">
                        <MaterialIcons name="quiz" size={14} color="#ffffff" />
                        <Text style={{ color: "#ffffff", fontSize: 11, fontWeight: "500" }}>10 Perguntas</Text>
                    </View>
                    <View style={{ backgroundColor: "rgba(254, 166, 25, 0.2)" }} className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg">
                        <MaterialIcons name="bolt" size={14} color="#fea619" />
                        <Text style={{ color: "#fea619", fontSize: 11, fontWeight: "bold" }}>+100 XP</Text>
                    </View>
                    <View style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }} className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg">
                        <MaterialIcons name="speed" size={14} color="#ffffff" />
                        <Text style={{ color: "#ffffff", fontSize: 11, fontWeight: "500" }}>Nível Médio</Text>
                    </View>
                </View>

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
                        marginBottom: 10,
                    }}
                >
                    <Text style={{ color: "#684000", fontWeight: "bold", fontSize: 14 }}>
                        Jogar Desafio (+100 XP)
                    </Text>
                    <MaterialIcons name="arrow-forward" size={18} color="#684000" />
                </TouchableOpacity>

                <View className="flex-row items-center justify-center gap-1">
                    <MaterialIcons name="groups" size={15} color="#ffddb8" />
                    <Text style={{ color: "#dce1ff", fontSize: 11 }}>1.420 irmãos já jogaram hoje</Text>
                </View>
            </View>
        </View>
    );
}
