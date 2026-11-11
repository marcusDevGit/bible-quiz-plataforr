import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { QuizCategoryMeta } from "./types";

interface Props {
    categories: QuizCategoryMeta[];
}

export function ThematicCategoriesSection({ categories }: Props) {
    const router = useRouter();

    return (
        <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                    <MaterialIcons name="category" size={20} color="#00236f" />
                    <Text style={{ color: "#191c1e" }} className="font-bold text-base">
                        Coleções Temáticas
                    </Text>
                </View>
                <Text style={{ color: "#757682", fontSize: 12 }}>{categories.length} Temas</Text>
            </View>

            <View className="gap-3">
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        onPress={() =>
                            router.push({
                                pathname: "/quiz",
                                params: {
                                    categoryId: cat.id,
                                    categoryName: cat.name,
                                },
                            })
                        }
                        activeOpacity={0.85}
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: 18,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: "#e6e8ea",
                        }}
                        className="shadow-sm"
                    >
                        <View className="flex-row items-start justify-between mb-2">
                            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: cat.iconBg, alignItems: "center", justifyContent: "center" }}>
                                <MaterialIcons name={cat.iconName} size={24} color={cat.iconColor} />
                            </View>
                            <View style={{ backgroundColor: cat.badgeBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                                <Text style={{ color: cat.badgeColor, fontSize: 11, fontWeight: "bold" }}>
                                    {cat.badge}
                                </Text>
                            </View>
                        </View>

                        <Text className="font-bold text-base text-on-surface mb-0.5">{cat.name}</Text>
                        <Text style={{ color: "#757682", fontSize: 12, marginBottom: 12 }}>{cat.subtitle}</Text>

                        <View className="flex-row justify-between items-center mb-1.5">
                            <Text style={{ color: "#757682", fontSize: 11 }}>{cat.questionsCount} Quizzes disponíveis</Text>
                            <Text style={{ color: cat.iconColor, fontWeight: "bold", fontSize: 11 }}>
                                {cat.progressPercent}%
                            </Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: "#eceef0", borderRadius: 3, overflow: "hidden" }}>
                            <View style={{ height: "100%", width: `${cat.progressPercent}%`, backgroundColor: cat.iconColor, borderRadius: 3 }} />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
