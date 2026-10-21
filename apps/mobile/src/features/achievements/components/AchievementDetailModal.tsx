import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Achievement } from "../services/achievements.service";
import {
    ACHIEVEMENT_GUIDES,
    DEFAULT_GUIDE,
    ICON_MAP,
    RARITY_STYLES,
} from "../constants/achievements.constants";

interface AchievementDetailModalProps {
    achievement: Achievement | null;
    visible: boolean;
    onClose: () => void;
}

export function AchievementDetailModal({
    achievement,
    visible,
    onClose,
}: AchievementDetailModalProps) {
    const router = useRouter();

    if (!achievement) return null;

    const isUnlocked = !!achievement.unlocked || !!achievement.unlockedAt;
    const guide = ACHIEVEMENT_GUIDES[achievement.code] ?? DEFAULT_GUIDE;
    const style = RARITY_STYLES[achievement.rarity] ?? RARITY_STYLES.COMMON;
    const iconName = ICON_MAP[achievement.code] ?? "military-tech";
    const displayName = achievement.name || achievement.title || "Conquista";

    const handlePlayQuiz = () => {
        onClose();
        router.push(guide.targetRoute as any);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 20,
                }}
            >
                <View
                    style={{
                        width: "100%",
                        maxWidth: 380,
                        backgroundColor: "#ffffff",
                        borderRadius: 28,
                        padding: 24,
                        alignItems: "center",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.2,
                        shadowRadius: 16,
                        elevation: 10,
                    }}
                >
                    {/* Medalha em Destaque */}
                    <View
                        style={{
                            width: 88,
                            height: 88,
                            borderRadius: 44,
                            borderWidth: 4,
                            borderColor: isUnlocked ? style.ring : "#c5c5d3",
                            backgroundColor: isUnlocked ? style.bg : "#eceef0",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 14,
                        }}
                    >
                        <MaterialIcons
                            name={iconName}
                            size={44}
                            color={isUnlocked ? style.icon : "#757682"}
                        />
                    </View>

                    {/* Título & Raridade */}
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            color: "#191c1e",
                            textAlign: "center",
                            marginBottom: 4,
                        }}
                    >
                        {displayName}
                    </Text>

                    <View
                        style={{
                            backgroundColor: style.bg,
                            paddingHorizontal: 10,
                            paddingVertical: 3,
                            borderRadius: 12,
                            marginBottom: 12,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 10,
                                fontWeight: "700",
                                color: style.labelColor,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                            }}
                        >
                            {style.label} • {guide.categoryLabel}
                        </Text>
                    </View>

                    <Text
                        style={{
                            fontSize: 13,
                            color: "#444651",
                            textAlign: "center",
                            marginBottom: 16,
                            lineHeight: 18,
                        }}
                    >
                        {achievement.description}
                    </Text>

                    {/* Box: Como Desbloquear & Quiz Relacionado */}
                    <View
                        style={{
                            width: "100%",
                            backgroundColor: "#f7f9fb",
                            borderRadius: 18,
                            padding: 14,
                            borderWidth: 1,
                            borderColor: "#e6e8ea",
                            marginBottom: 16,
                        }}
                    >
                        <View className="flex-row items-center gap-2 mb-2">
                            <MaterialIcons name="help-outline" size={18} color="#00236f" />
                            <Text style={{ fontSize: 13, fontWeight: "bold", color: "#00236f" }}>
                                Como Desbloquear
                            </Text>
                        </View>

                        <Text style={{ fontSize: 12, color: "#444651", lineHeight: 16, marginBottom: 8 }}>
                            {guide.howToUnlock}
                        </Text>

                        <View className="flex-row items-center gap-1.5 pt-1 border-t border-outline-variant/30">
                            <MaterialIcons name="menu-book" size={14} color="#fea619" />
                            <Text style={{ fontSize: 11, fontWeight: "600", color: "#855300" }}>
                                Quiz recomendado: {guide.relatedQuizName}
                            </Text>
                        </View>
                    </View>

                    {/* Progresso Atual ou Status de Desbloqueado */}
                    {!isUnlocked ? (
                        <View
                            style={{
                                width: "100%",
                                backgroundColor: "rgba(0, 35, 111, 0.04)",
                                borderRadius: 16,
                                padding: 12,
                                marginBottom: 18,
                                borderWidth: 1,
                                borderColor: "rgba(0, 35, 111, 0.12)",
                            }}
                        >
                            <View className="flex-row justify-between items-center mb-1.5">
                                <Text style={{ fontSize: 11, fontWeight: "600", color: "#00236f" }}>
                                    Seu Progresso Atual
                                </Text>
                                <Text style={{ fontSize: 11, fontWeight: "bold", color: "#00236f" }}>
                                    {achievement.progress ?? 0}%
                                </Text>
                            </View>
                            <View
                                style={{
                                    height: 6,
                                    backgroundColor: "#e0e3e5",
                                    borderRadius: 3,
                                    overflow: "hidden",
                                }}
                            >
                                <View
                                    style={{
                                        height: "100%",
                                        width: `${achievement.progress ?? 0}%`,
                                        backgroundColor: "#00236f",
                                        borderRadius: 3,
                                    }}
                                />
                            </View>
                        </View>
                    ) : (
                        <View
                            style={{
                                width: "100%",
                                backgroundColor: "rgba(39, 195, 138, 0.1)",
                                borderRadius: 14,
                                padding: 10,
                                marginBottom: 18,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                            }}
                        >
                            <MaterialIcons name="check-circle" size={18} color="#27c38a" />
                            <Text style={{ fontSize: 12, fontWeight: "bold", color: "#00311f" }}>
                                Conquista Desbloqueada (+{achievement.xpReward} XP)
                            </Text>
                        </View>
                    )}

                    {/* Botões de Ação */}
                    <View style={{ width: "100%", gap: 8 }}>
                        <TouchableOpacity
                            onPress={handlePlayQuiz}
                            activeOpacity={0.85}
                            style={{
                                backgroundColor: "#00236f",
                                borderRadius: 14,
                                paddingVertical: 13,
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "row",
                                gap: 8,
                            }}
                        >
                            <Text style={{ color: "#ffffff", fontSize: 13, fontWeight: "bold" }}>
                                Jogar Quiz Relacionado
                            </Text>
                            <MaterialIcons name="arrow-forward" size={16} color="#ffffff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.7}
                            style={{
                                paddingVertical: 10,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text style={{ color: "#757682", fontSize: 13, fontWeight: "600" }}>
                                Fechar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
