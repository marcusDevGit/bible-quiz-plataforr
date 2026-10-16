import React, { useState } from "react";
import {
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import BrandLogo from "@/components/common/BrandLogo";
import { apiFetch } from "@/services/api";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSendRecovery = async () => {
        setErrorMsg("");
        if (!email.trim()) {
            setErrorMsg("Digite o seu e-mail cadastrado");
            return;
        }

        try {
            setLoading(true);
            await apiFetch("/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });
            setSubmitted(true);
        } catch (err: any) {
            setErrorMsg(err.message || "Erro ao solicitar recuperação.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-surface">
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 48 }}
                className="px-margin-mobile py-4"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Luz Ambiente Superior */}
                <LinearGradient
                    colors={["rgba(220, 225, 255, 0.6)", "rgba(247, 249, 251, 0)"]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{
                        position: "absolute",
                        top: -50,
                        left: -30,
                        right: -30,
                        height: 260,
                    }}
                    pointerEvents="none"
                />

                {/* TopBar com Botão Voltar */}
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-surface-container-low items-center justify-center border border-outline-variant/30 active:bg-surface-container-highest"
                        onPress={() => {
                            if (router.canGoBack()) {
                                router.back();
                            } else {
                                router.replace("/login");
                            }
                        }}
                    >
                        <MaterialIcons name="arrow-back" size={20} color="#00236f" />
                    </TouchableOpacity>
                </View>

                {/* Branding & Logo Oficial com Bolinha Pulsante */}
                <View className="items-center mb-6">
                    <View className="mb-3">
                        <BrandLogo size={68} />
                    </View>
                    <Text className="text-2xl font-bold text-on-surface mb-2">
                        Recuperar Senha
                    </Text>
                    <Text className="text-sm text-on-surface-variant text-center max-w-xs leading-5">
                        Informe o e-mail associado à sua conta para receber as instruções de
                        redefinição.
                    </Text>
                </View>

                {/* Formulário ou Mensagem de Sucesso */}
                {submitted ? (
                    <View className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm items-center">
                        <View className="w-14 h-14 rounded-full bg-primary-fixed items-center justify-center mb-3">
                            <MaterialIcons name="mark-email-read" size={28} color="#00236f" />
                        </View>
                        <Text className="text-lg font-bold text-on-surface mb-1 text-center">
                            E-mail enviado!
                        </Text>
                        <Text className="text-sm text-on-surface-variant text-center mb-6 leading-5">
                            Se o endereço informado estiver cadastrado, você receberá um link
                            para cadastrar uma nova senha.
                        </Text>
                        <TouchableOpacity
                            className="w-full bg-primary py-3.5 rounded-xl items-center"
                            onPress={() => router.replace("/login")}
                        >
                            <Text className="font-bold text-on-primary text-base">
                                Voltar para o Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
                        <Text className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                            E-mail
                        </Text>
                        <View className="flex-row items-center bg-surface-container-low px-3.5 py-3 rounded-xl border border-outline-variant/40 mb-4 focus:border-primary">
                            <MaterialIcons name="mail-outline" size={20} color="#757682" />
                            <TextInput
                                className="flex-1 ml-2.5 text-on-surface text-sm"
                                placeholder="seu.email@exemplo.com"
                                placeholderTextColor="#757682"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        {errorMsg ? (
                            <View className="bg-error-container/40 p-2.5 rounded-lg mb-3 flex-row items-center">
                                <MaterialIcons name="error-outline" size={18} color="#ba1a1a" />
                                <Text className="text-error text-xs font-medium ml-2 flex-1">
                                    {errorMsg}
                                </Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            className="w-full bg-primary py-3.5 rounded-xl items-center flex-row justify-center shadow-md shadow-primary/20 active:opacity-90"
                            onPress={handleSendRecovery}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#ffffff" className="mr-2" />
                            ) : null}
                            <Text className="font-bold text-on-primary text-base">
                                Enviar Instruções
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
