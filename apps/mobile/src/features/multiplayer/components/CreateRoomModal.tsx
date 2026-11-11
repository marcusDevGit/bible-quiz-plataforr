import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/features/categories/services/category.service";

interface CreateRoomModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (theme: string) => void;
}

// Lista de temas bíblicos cadastrados (fallback padrão)
const FALLBACK_THEMES = [
    { id: "Geral (Aleatório)", label: "Geral (Aleatório)", icon: "shuffle", desc: "Perguntas de toda a Bíblia" },
    { id: "Pentateuco", label: "Pentateuco", icon: "menu-book", desc: "De Gênesis a Deuteronômio" },
    { id: "Patriarcas", label: "Patriarcas", icon: "groups", desc: "Abraão, Isaque, Jacó e José" },
    { id: "Evangelhos", label: "Evangelhos", icon: "auto-stories", desc: "Vida e ministério de Jesus" },
    { id: "Novo Testamento", label: "Novo Testamento", icon: "church", desc: "Cartas, Atos e Apocalipse" },
];

const CATEGORY_ICONS: string[] = [
    "menu-book",
    "auto-stories",
    "groups",
    "church",
    "auto-awesome",
    "history-edu",
];

export function CreateRoomModal({ visible, onClose, onConfirm }: CreateRoomModalProps) {
    const [selectedTheme, setSelectedTheme] = useState("Geral (Aleatório)");

    const { data: apiCategories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryService.getCategories(),
        enabled: visible,
    });

    const themes =
        apiCategories.length > 0
            ? [
                  {
                      id: "Geral (Aleatório)",
                      label: "Geral (Aleatório)",
                      icon: "shuffle",
                      desc: "Perguntas de toda a Bíblia",
                  },
                  ...apiCategories.map((cat, idx) => ({
                      id: cat.name,
                      label: cat.name,
                      icon: CATEGORY_ICONS[idx % CATEGORY_ICONS.length],
                      desc: `${cat._count?.questions ?? 10} perguntas disponíveis`,
                  })),
              ]
            : FALLBACK_THEMES;

    const handleCreate = () => {
        onConfirm(selectedTheme);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 bg-black/60 justify-end">
                <View className="bg-surface rounded-t-3xl p-6 max-w-xl mx-auto w-full border-t border-outline-variant/30">
                    {/* Cabeçalho */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="font-headline-md font-bold text-primary">Criar Sala Privada</Text>
                            <Text className="font-body-sm text-on-surface-variant">
                                Escolha o tema das perguntas para a sua partida
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-10 h-10 rounded-full bg-surface-container-low items-center justify-center border border-outline-variant/40"
                        >
                            <MaterialIcons name="close" size={20} color="#444651" />
                        </TouchableOpacity>
                    </View>

                    {/* Lista de Temas */}
                    <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
                        <View className="flex-col gap-2.5 my-2">
                            {themes.map((theme) => {
                                const isSelected = selectedTheme === theme.id;
                                return (
                                    <TouchableOpacity
                                        key={theme.id}
                                        activeOpacity={0.8}
                                        onPress={() => setSelectedTheme(theme.id)}
                                        className={`p-4 rounded-2xl border flex-row items-center gap-3.5 ${isSelected
                                                ? "bg-primary/5 border-primary"
                                                : "bg-surface-container-lowest border-outline-variant/30"
                                            }`}
                                    >
                                        <View
                                            className={`w-10 h-10 rounded-full items-center justify-center ${isSelected ? "bg-primary" : "bg-surface-container-high"
                                                }`}
                                        >
                                            <MaterialIcons
                                                name={theme.icon as any}
                                                size={22}
                                                color={isSelected ? "#ffffff" : "#444651"}
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text
                                                className={`font-title-md font-bold ${isSelected ? "text-primary" : "text-on-surface"
                                                    }`}
                                            >
                                                {theme.label}
                                            </Text>
                                            <Text className="font-body-sm text-on-surface-variant text-xs mt-0.5">
                                                {theme.desc}
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <MaterialIcons name="check-circle" size={24} color="#00236f" />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>

                    {/* Botão de Criação */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleCreate}
                        className="w-full mt-4 bg-primary py-4 rounded-xl items-center justify-center shadow-md"
                    >
                        <Text className="text-white font-title-md font-bold">Criar Sala com este Tema</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
