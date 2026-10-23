import React from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface MatchmakingModalProps {
    visible: boolean;
    userLevel?: number;
    statusMessage?: string;
    onCancel: () => void;
}

export function MatchmakingModal({
    visible,
    userLevel = 1,
    statusMessage = "Procurando adversário do seu nível...",
    onCancel,
}: MatchmakingModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View className="flex-1 bg-black/60 justify-center items-center px-6">
                <View
                    className="bg-surface rounded-3xl p-6 w-full max-w-sm items-center border border-outline-variant/30 shadow-2xl"
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.25,
                        shadowRadius: 15,
                        elevation: 10,
                    }}
                >
                    {/* Indicador de carregamento */}
                    <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4 border border-primary/20">
                        <ActivityIndicator size="large" color="#00236f" />
                    </View>

                    <Text className="font-headline-md font-bold text-primary text-center">
                        Buscando Oponente
                    </Text>

                    {/* Badge de Nível */}
                    <View className="mt-2 bg-secondary-container/20 px-3 py-1 rounded-full border border-secondary-container/30">
                        <Text className="text-secondary font-bold text-xs">
                            Seu Nível: {userLevel} (Pareando ±3)
                        </Text>
                    </View>

                    <Text className="font-body-md text-on-surface-variant text-center mt-3 mb-6 px-2">
                        {statusMessage}
                    </Text>

                    {/* Botão Cancelar Busca */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={onCancel}
                        className="w-full py-3.5 rounded-xl border border-outline-variant bg-surface-container-low items-center flex-row justify-center gap-2"
                    >
                        <MaterialIcons name="close" size={20} color="#444651" />
                        <Text className="font-title-md font-bold text-on-surface-variant">
                            Cancelar Busca
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
