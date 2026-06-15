import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { authService } from "@/features/auth/services/auth.service";

export default function RegisterScreem() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
      await authService.register({ name, email, password });
      router.replace("/");
    } catch (err: any) {
      alert("Erro ao cria conta" + err.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface max-w-md mx-auto w-full relative justify-center px-margin-mobile">
      <Text className="font-headline-lg text-[32px] font-bold text-primary text-center mb-8">
        Criar Conta
      </Text>
      <TextInput
        className="bg-surface-container-highest rounded-xl px-4 py-4 mb-4 text-on-surface"
        placeholder="Seu Nome"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        className="bg-surface-container-highest rounded-xl px-4 py-4 mb-4 text-on-surface"
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        className="bg-surface-container-highest rounded-xl px-4 py-4 mb-8 text-on-surface"
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className="w-full bg-primary p-4 rounded-full items-center flex-row justify-center"
        onPress={handleRegister}
        disabled={loading}
      >
        {loading && <ActivityIndicator color="#ffffff" className="mr-2" />}
        <Text className="font-label-lg font-bold text-on-primary">
          Cadastrar e Entrar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-6"
        onPress={() => router.replace("/login")}
      >
        <Text className="text-primary font-bold text-center">
          Já tem conta? Faça Login
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
