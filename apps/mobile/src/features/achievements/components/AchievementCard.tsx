import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Achievement } from "../services/achievements.service";
import { ICON_MAP, RARITY_STYLES } from "../constants/achievements.constants";

interface AchievementCardProps {
    item: Achievement;
    onPress: () => void;
}

export function AchievementCard({ item, onPress }: AchievementCardProps) {
    const isUnlocked = !!item.unlocked || !!item.unlockedAt;
    const style = RARITY_STYLES[item.rarity] ?? RARITY_STYLES.COMMON;
    const iconName = ICON_MAP[item.code] ?? "military-tech";
    const displayName = item.name || item.title || "Conquista";
    const progressVal = Math.min(100, Math.max(0, item.progress ?? 0));

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            style={{
                width: "48%",
                backgroundColor: isUnlocked ? "#ffffff" : "#f2f4f6",
                borderColor: isUnlocked ? "rgba(197, 197, 211, 0.5)" : "#e0e3e5",
                borderWidth: 1,
                borderRadius: 20,
                padding: 16,
                alignItems: "center",
                position: "relative",
                shadowColor: "#00236f",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: isUnlocked ? 0.05 : 0,
                shadowRadius: 6,
                elevation: isUnlocked ? 2 : 0,
                opacity: isUnlocked ? 1 : 0.85,
            }}
        >
            {/* Estrela de honra se já desbloqueada */}
            {isUnlocked && (
                <View style={{ position: "absolute", top: 10, right: 10 }}>
                    <MaterialIcons name="star" size={16} color="#fea619" />
                </View>
            )}

            {/* Medalha Circular */}
            <View
                style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    borderWidth: 3.5,
                    borderColor: isUnlocked ? style.ring : "#c5c5d3",
                    backgroundColor: isUnlocked ? style.bg : "#e6e8ea",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                }}
            >
                <MaterialIcons
                    name={iconName}
                    size={34}
                    color={isUnlocked ? style.icon : "#757682"}
                />

                {!isUnlocked && (
                    <View
                        style={{
                            position: "absolute",
                            bottom: -4,
                            right: -4,
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            backgroundColor: "#ffffff",
                            borderWidth: 1.5,
                            borderColor: "#c5c5d3",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <MaterialIcons name="lock" size={12} color="#757682" />
                    </View>
                )}
            </View>

            <Text
                style={{
                    fontSize: 13,
                    fontWeight: "bold",
                    color: isUnlocked ? "#191c1e" : "#444651",
                    textAlign: "center",
                    marginBottom: 3,
                }}
                numberOfLines={2}
            >
                {displayName}
            </Text>

            <Text
                style={{
                    fontSize: 11,
                    color: "#757682",
                    textAlign: "center",
                    lineHeight: 14,
                    minHeight: 28,
                }}
                numberOfLines={2}
            >
                {item.description}
            </Text>

            {/* Badge de Raridade */}
            <View
                style={{
                    backgroundColor: isUnlocked ? style.bg : "#e6e8ea",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 10,
                    marginTop: 8,
                }}
            >
                <Text
                    style={{
                        fontSize: 9,
                        fontWeight: "700",
                        color: isUnlocked ? style.labelColor : "#757682",
                        textTransform: "uppercase",
                    }}
                >
                    {style.label}
                </Text>
            </View>

            {/* Progresso ou Recompensa */}
            {isUnlocked ? (
                <Text
                    style={{
                        fontSize: 11,
                        color: "#855300",
                        fontWeight: "bold",
                        marginTop: 6,
                    }}
                >
                    +{item.xpReward} XP
                </Text>
            ) : (
                <View style={{ width: "100%", marginTop: 8 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                        <Text style={{ fontSize: 9, color: "#757682" }}>{progressVal === 0 ? "Não iniciada" : "Progresso"}</Text>
                        <Text style={{ fontSize: 9, color: "#757682", fontWeight: "bold" }}>
                            {progressVal}%
                        </Text>
                    </View>
                    <View
                        style={{
                            height: 5,
                            backgroundColor: "#e0e3e5",
                            borderRadius: 3,
                            overflow: "hidden",
                        }}
                    >
                        <View
                            style={{
                                height: "100%",
                                width: `${progressVal}%`,
                                backgroundColor: "#757682",
                            }}
                        />
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
}
