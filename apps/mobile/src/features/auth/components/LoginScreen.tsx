import { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => authService.Login({ email, password }),
    onSuccess: (data) => {
      console.log("Login feito!", data.user.name);
      router.replace("/");
    },
    onError: (error: any) => {
      setErrorMsg(error.message || "Erro ao fazer login.");
    },
  });

  const handleLogin = () => {
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Preencha todos os campos");
      return;
    }
    loginMutation.mutate();
  };

  return (
    <SafeAreaView className="flex-1 bg-surface max-w-md mx-auto w-full relative justify-center px-margin-mobile">
      <Text className="font-headline-lg text-[40px] font-bold text-primary text-center mb-8">
        BibleQuest
      </Text>

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

      {errorMsg ? (
        <Text className="mb-4 text-center font-bold text-error">
          {errorMsg}
        </Text>
      ) : null}

      <TouchableOpacity
        className="w-full bg-primary p-4 rounded-full items-center flex-row justify-center"
        onPress={handleLogin}
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending && (
          <ActivityIndicator color="#ffffff" className="mr-2" />
        )}
        <Text className="font-label-lg font-bold text-on-primary">Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-6"
        onPress={() => router.replace("/register")}
      >
        <Text className="text-primary font-bold text-center">
          Ainda não tem conta? Cadastre-se
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
