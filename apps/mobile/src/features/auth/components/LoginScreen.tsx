import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { authService } from "@/features/auth/services/auth.service";
import BrandLogo from "~/src/components/common/BrandLogo";
import { platform } from "node:os";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadRememberedEmail() {
      try {
        const savedEmail = Platform.OS === "web"
          ? localStorage.getItem("remembered_email")
          : await SecureStore.getItemAsync("remembered_email");

        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (err) {
        console.warn("Erro ao busca email salvo", err)
      }
    }
    loadRememberedEmail()
  }, [])

  const loginMutation = useMutation({
    mutationFn: () =>
      authService.Login({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      }),
    onSuccess: async (data) => {
      console.log("Login realizado com sucesso!", data.user.name);

      try {
        if (rememberMe) {
          const cleanEmail = email.trim().toLowerCase()
          if (Platform.OS === "web") {
            localStorage.setItem("remembered_email", cleanEmail);
          } else {
            await SecureStore.setItemAsync("remembered_email", cleanEmail);
          }
        } else {
          if (Platform.OS === "web") {
            localStorage.removeItem("remembered_email");
          } else {
            await SecureStore.deleteItemAsync("remembered_email");
          }
        }
      } catch (e) {
        console.warn("Erro ao atualizar credencial", e);
      }

      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      setErrorMsg(error.message || "Credenciais inválidas. Tente novamente.");
    },
  });


  const handleLogin = () => {
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Preencha todos os campos para continuar.");
      return;
    }
    loginMutation.mutate();
  };

  const handleGuestMode = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-surface ">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 48 }}
        className="px-margin-mobile py-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full">
          {/* 1. Ambient Glow & Branding */}
          <View className="items-center relative mb-6 pt-4">

            {/* Luz 1: Banho azul no topo desvanecendo para baixo (sem bordas) */}
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
            {/* Luz 2: Irradiação Dourada/Laranja no Canto Superior Direito */}
            <LinearGradient
              colors={[
                "rgba(255, 185, 95, 0.5)", // Âmbar / Laranja
                "rgba(255, 221, 184, 0.2)",
                "transparent", // Dissolve sem bordas
              ]}
              start={{ x: 1, y: 0 }} // Nasce exatamente no canto superior direito
              end={{ x: 0, y: 0.8 }} // Dissipa em direção ao centro
              style={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 220,
                height: 220,
              }}
              pointerEvents="none"
            />
            {/**ícone de Destaque / Logo */}
            <View className="relative mb-3">
              <BrandLogo size={68} />
            </View>

            {/**Nome da Marca */}
            <Text className="text-3xl font-extrabold text-primary tracking-tight mb-2">
              Bible
              <Text className="text-secondary-container">Quest</Text>
            </Text>

            {/* Badge de Gamificação */}
            <View className="flex-row items-center bg-primary-fixed/50 px-3.5 py-1.5 rounded-full mb-3 ">
              <MaterialIcons name="auto-awesome" size={14} color="#00236f" />
              <Text className="text-primary text-sm font-bold ml-2">
                Jornada de Fé & Conhecimento
              </Text>
            </View>
            <Text className="text-2xl font-bold text-on-surface mb-1">
              Bem-vindo de volta! 👋
            </Text>
            <Text className="text-sm text-on-surface-variant text-center max-w-xs">
              Entre na sua conta para proteger sua ofensiva e subir no ranking.
            </Text>
          </View>

          {/* 2. Card Principal de Login */}
          <View className="w-full bg-surface-container-lowest rounded-2xl p-5 shadow-sm shadow-primary/5 mb-4 border border-outline-variant/20">
            {/* Campo E-mail */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-xs font-bold text-on-surface">E-mail</Text>
              </View>

              <View className="flex-row items-center bg-surface-container-low rounded-xl px-3 py-3 border border-outline-variant/30">
                <MaterialIcons name="mail-outline" size={20} color="#757682" />
                <TextInput
                  className="flex-1 ml-2.5 text-on-surface text-sm"
                  placeholder="seu.email@exemplo.com"
                  placeholderTextColor="#757682"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Campo Senha */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-on-surface mb-1.5">Senha</Text>

              <View className="flex-row items-center bg-surface-container-low rounded-xl px-3 py-3 border border-outline-variant/30">
                <MaterialIcons name="lock-outline" size={20} color="#757682" />
                <TextInput
                  className="flex-1 ml-2.5 text-on-surface text-sm"
                  placeholder="Sua senha "
                  placeholderTextColor="#757682"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color="#757682"
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between items-center mt-3">
                <TouchableOpacity className="flex-row items-center active:opacity-80" onPress={() => setRememberMe((prev) => !prev)}>
                  <MaterialIcons name={rememberMe ? "check-box" : "check-box-outline-blank"} size={20} color={rememberMe ? "#00236f" : "#757682"} />
                  <Text className="text-xs text-on-surface ml-1.5 font-medium">Lembrar-me</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/forgot-password")}>
                  <Text className="text-xs font-semibold text-primary">Recuperar senha</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Mensagem de Erro */}
            {errorMsg ? (
              <View className="bg-error-container/40 p-2.5 rounded-lg mb-3 flex-row items-center">
                <MaterialIcons name="error-outline" size={18} color="#ba1a1a" />
                <Text className="text-error text-xs font-medium ml-2 flex-1">
                  {errorMsg}
                </Text>
              </View>
            ) : null}
            {/* Botão de Entrar */}
            <TouchableOpacity
              className="w-full bg-primary py-3.5 rounded-xl items-center flex-row justify-center shadow-md shadow-primary/20 active:opacity-90"
              onPress={handleLogin}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <ActivityIndicator color="#ffffff" className="mr-2" />
              ) : null}
              <Text className="font-bold text-on-primary text-base mr-1.5">
                Entrar no BibleQuest
              </Text>
              <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
          {/* 3. Divisor */}
          <View className="flex-row items-center my-3">
            <View className="flex-1 h-[1px] bg-outline-variant/30" />
            <Text className="mx-3 text-sm text-on-surface-variant font-medium uppercase tracking-wider">
              ou continue com
            </Text>
            <View className="flex-1 h-[1px] bg-outline-variant/30" />
          </View>

          {/* Botão Google */}
          <TouchableOpacity
            className="w-full bg-surface-container-lowest py-3 rounded-xl items-center flex-row justify-center border border-outline-variant/30 mb-2.5 active:bg-surface-container-low"
            onPress={() => console.log("Google Login")}
          >
            <MaterialIcons name="g-mobiledata" size={24} color="#4285F4" />
            <Text className="font-semibold text-on-surface text-sm ml-1">
              Continuar com Google
            </Text>
          </TouchableOpacity>

          {/* 4. Acesso Convidado */}
          <TouchableOpacity
            className="w-full bg-surface-container-lowest py-3 rounded-xl items-center flex-row justify-center border border-outline-variant/30 mb-4 active:bg-surface-container-low"
            onPress={handleGuestMode}
          >
            <MaterialIcons name="person-outline" size={20} color="#00236f" />
            <Text className="font-semibold text-primary text-sm ml-2">
              Entrar como Convidado (Modo Rápido)
            </Text>
          </TouchableOpacity>
          {/* 5. Card Motivacional de Ofensiva (+50 XP) */}
          <View className="bg-secondary-fixed/30 border border-secondary-container/40 rounded-xl p-3 flex-row items-center mb-5">
            <View className="w-10 h-10 rounded-full bg-secondary-container/20 items-center justify-center mr-3">
              <MaterialIcons
                name="local-fire-department"
                size={22}
                color="#855300"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-on-secondary-fixed-variant">
                Não perca sua ofensiva diária!
              </Text>
              <Text className="text-[11px] text-on-secondary-fixed-variant/80">
                Faça login hoje e garanta +50 XP de bônus no ranking.
              </Text>
            </View>
          </View>
          {/* 6. Link de Cadastro */}
          <TouchableOpacity
            className="items-center py-2"
            onPress={() => router.replace("/register")}
          >
            <Text className="text-sm text-on-surface-variant">
              Ainda não tem conta?{" "}
              <Text className="text-primary font-bold">Cadastre-se agora</Text>
            </Text>
          </TouchableOpacity>
          <Text className="text-[11px] text-on-surface-variant/70 text-center mt-4 px-6">
            Ao continuar, você concorda com nossos{" "}
            <Text className="text-primary underline">Termos de Uso</Text> e{" "}
            <Text className="text-primary underline">
              Política de Privacidade
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
