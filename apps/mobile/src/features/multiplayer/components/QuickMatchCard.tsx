import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface QuickMatchCardProps {
    onPress: () => void;
    disabled?: boolean;
}

export function QuickMatchCard({ onPress, disabled }: QuickMatchCardProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            disabled={disabled}
            className="relative bg-surface-container-lowest rounded-2xl p-6 border border-primary/20 overflow-hidden shadow-sm"
            style={{
                shadowColor: "#00236f",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
                elevation: 3,
            }}
        >
            {/* Elemento Decorativo */}
            <View className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-primary/5 pointer-events-none" />

            <View className="flex-col gap-4">
                {/* Cabeçalho do Card */}
                <View className="flex-row items-center justify-between">
                    <View className="w-12 h-12 rounded-full bg-primary items-center justify-center shadow-md">
                        <MaterialIcons name="bolt" size={28} color="#fea619" />
                    </View>
                    <View className="bg-secondary-container/20 border border-secondary-container/40 px-3 py-1 rounded-full">
                        <Text className="text-secondary font-bold text-xs uppercase tracking-wider">
                            Recomendado
                        </Text>
                    </View>
                </View>

                {/* Textos */}
                <View>
                    <Text className="font-headline-md font-bold text-on-surface">
                        Partida Rápida
                    </Text>
                    <Text className="font-body-md text-on-surface-variant mt-1">
                        Encontre adversários do seu nível instantaneamente com temas aleatórios.
                    </Text>
                </View>

                {/* Rodapé interativo */}
                <View className="flex-row items-center justify-between pt-2 border-t border-outline-variant/20">
                    <Text className="text-xs font-semibold text-primary">
                        1v1 Automático • Sem Espera
                    </Text>
                    <View className="flex-row items-center gap-1">
                        <Text className="text-sm font-bold text-primary">Jogar Agora</Text>
                        <MaterialIcons name="chevron-right" size={20} color="#00236f" />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
