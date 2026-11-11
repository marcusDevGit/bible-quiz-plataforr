import BrandLogo from "@/components/common/BrandLogo";
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
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { authService } from "@/features/auth/services/auth.service";

export default function RegisterScreem() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [receiveDailyVerse, setReceiveDailyVerse] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("")


  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8 && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password) && password.length >= 8) score++;
    return score;
  }

  const strength = getPasswordStrength();

  const handleRegister = async () => {
    setErrorMsg("");
    if (!name || !email || !password) {
      setErrorMsg("Preencha todos os campos");
      return;
    }
    if (!agreeTerms) {
      setErrorMsg("Você precisa aceitar os termos e condições para continuar");
      return;
    }

    try {
      setLoading(true);
      await authService.register({ name, email, password });
      router.replace("/(tabs)");
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface ">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 48 }} className="px-margin-mobile py-4" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
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
          pointerEvents="none" />

        {/* Luz 2: Irradiação dourada no canto superior direito */}
        <LinearGradient
          colors={[
            "rgba(255, 185, 95, 0.5)",
            "rgba(255, 221, 184, 0.2)",
            "transparent",
          ]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0.8 }}
          style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 220,
            height: 220,
          }}
          pointerEvents="none"
        />

        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity className="w-10 h-10 rounded-full bg-surface-container-low items-center justify-center border border-outline-variant/30 active:bg-surface-container-highest"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/login")
              }
            }}>
            <MaterialIcons name="arrow-back" size={20} color="#00236f" />
          </TouchableOpacity>

          <View className="flex-row items-center bg-secondary-fixed/50 px-3.5 py-1.5 rounded-full border border-secondary/20 shadow-xs">
            <MaterialIcons name="auto-awesome" size={14} color="#855300" />
            <Text className="text-on-secondary-fixed text-sm font-body ml-1.5">
              Passo 1 de 2
            </Text>
          </View>
          <View className="w-10 h-10" />
        </View>
        {/* 2. Header & Branding */}
        <View className="items-center mb-5">
          <View className="relative mb-3">
            <BrandLogo size={68} />
          </View>
          <View className="flex-row items-center bg-primary-fixed px-4 py-2 rounded-full mb-3 border border-primary/10 shadow-xs">
            <MaterialIcons name="auto-awesome" size={16} color="#00236f" />
            <Text className="text-primary text-sm font-bold ml-1.5">
              Comece sua Jornada de Fé
            </Text>
          </View>
          <Text className="text-2xl font-bold text-on-surface mb-1">
            Crie sua conta gratuita
          </Text>
          <Text className="text-2xs text-on-surface-variant text-center max-w-xs leading-5">
            Junte-se a milhares de cristãos aprendendo e testando seus conhecimentos bíblicos diariamente!
          </Text>
        </View>

        {/* 4. Card do Formulário de Cadastro */}
        <View className="w-full bg-surface-container-lowest rounded-2xl p-5 shadow-sm shadow-primary/5 mb-4 border border-outline-variant/20">
          {/* Campo Nome */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-on-surface mb-1.5">
              Como devemos te chamar?
            </Text>
            <View className="flex-row items-center bg-surface-container-low rounded-xl px-3 py-3 border border-outline-variant/30">
              <MaterialIcons name="person-outline" size={20} color="#757682" />
              <TextInput
                className="flex-1 ml-2.5 text-on-surface text-sm"
                placeholder="Ex: Davi Oliveira"
                placeholderTextColor="#757682"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
          {/* Campo E-mail */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-on-surface mb-1.5">
              Seu melhor e-mail
            </Text>
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
          {/* Campo Senha com Barras de Força */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-1.5">
              <Text className="text-xs font-bold text-on-surface">
                Senha segura
              </Text>
              <Text className="text-[11px] text-on-surface-variant font-medium">
                Mínimo 8 caracteres
              </Text>
            </View>
            <View className="flex-row items-center bg-surface-container-low rounded-xl px-3 py-3 border border-outline-variant/30 mb-2.5">
              <MaterialIcons name="lock-outline" size={20} color="#757682" />
              <TextInput
                className="flex-1 ml-2.5 text-on-surface text-sm"
                placeholder="Crie uma senha forte"
                placeholderTextColor="#757682"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color="#757682"
                />
              </TouchableOpacity>
            </View>
            {/* Barras Indicadoras de Força */}
            <View className="flex-row gap-1.5 mb-2">
              <View style={{ height: 6 }}
                className={`flex-1 h-1.5 rounded-full ${strength >= 1 ? "bg-secondary-container" : "bg-surface-container-high"
                  }`}
              />
              <View style={{ height: 6 }}
                className={`flex-1 h-1.5 rounded-full ${strength >= 2 ? "bg-secondary-container" : "bg-surface-container-high"
                  }`}
              />
              <View style={{ height: 6 }}
                className={`flex-1 h-1.5 rounded-full ${strength >= 3 ? "bg-tertiary-fixed-dim" : "bg-surface-container-high"
                  }`}
              />
            </View>
            <View className="flex-row items-center">
              <MaterialIcons name="verified-user" size={14} color="#4edea3" />
              <Text className="text-[12px] text-on-surface-variant ml-2 flex-1">
                Combine maiúsculas, números e símbolos para uma proteção firme.
              </Text>
            </View>
          </View>
          {/* Checkboxes de Aceite e Notificações */}
          <TouchableOpacity
            className="flex-row items-start mb-3"
            onPress={() => setAgreeTerms((prev) => !prev)}
          >
            <MaterialIcons
              name={agreeTerms ? "check-box" : "check-box-outline-blank"}
              size={20}
              color={agreeTerms ? "#00236f" : "#757682"}
            />
            <Text className="text-xs text-on-surface ml-2 flex-1 leading-4">
              Li e concordo com os{" "}
              <Text className="text-primary font-bold underline">Termos de Serviço</Text> e{" "}
              <Text className="text-primary font-bold underline">Política de Privacidade</Text>.
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-start mb-4"
            onPress={() => setReceiveDailyVerse((prev) => !prev)}
          >
            <MaterialIcons
              name={receiveDailyVerse ? "check-box" : "check-box-outline-blank"}
              size={20}
              color={receiveDailyVerse ? "#00236f" : "#757682"}
            />
            <Text className="text-xs text-on-surface ml-2 flex-1 leading-4">
              Quero receber o{" "}
              <Text className="text-secondary font-bold">Versículo do Dia</Text> e
              lembretes diários.
            </Text>
          </TouchableOpacity>
          {/* Mensagem de Erro Inline */}
          {errorMsg ? (
            <View className="bg-error-container/40 p-2.5 rounded-lg mb-3 flex-row items-center">
              <MaterialIcons name="error-outline" size={18} color="#ba1a1a" />
              <Text className="text-error text-xs font-medium ml-2 flex-1">
                {errorMsg}
              </Text>
            </View>
          ) : null}
          {/* Botão de Cadastro com Badge de XP */}
          <TouchableOpacity
            className="w-full bg-primary py-3.5 rounded-xl items-center flex-row justify-center shadow-md shadow-primary/20 active:opacity-90"
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" className="mr-2" />
            ) : null}
            <Text className="font-bold text-on-primary text-base mr-2">
              Criar Conta & Começar
            </Text>
            <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
        {/* 4. Divisor Visual */}
        <View className="flex-row items-center my-3">
          <View className="flex-1 h-[1px] bg-outline-variant/30" />
          <Text className="mx-3 text-xs text-on-surface-variant font-medium uppercase tracking-wider">
            ou cadastre-se com
          </Text>
          <View className="flex-1 h-[1px] bg-outline-variant/30" />
        </View>

        {/* 5. Botão Google */}
        <TouchableOpacity
          className="w-full bg-surface-container-lowest py-3.5 rounded-xl items-center flex-row justify-center border border-outline-variant/30 mb-4 active:bg-surface-container-low shadow-sm shadow-primary/5"
          onPress={() => console.log("Cadastrar com Google")}
        >
          <MaterialIcons name="g-mobiledata" size={26} color="#4285F4" />
          <Text className="font-semibold text-on-surface text-sm ml-1">
            Cadastrar com Google
          </Text>
        </TouchableOpacity>

        {/* 6. Link para Retornar ao Login */}
        <TouchableOpacity
          className="items-center py-2 mb-2"
          onPress={() => router.replace("/login")}
        >
          <Text className="text-sm text-on-surface-variant">
            Já tem uma conta no BibleQuest?{" "}
            <Text className="text-primary font-bold">Entrar</Text>
          </Text>
        </TouchableOpacity>

        {/* 7. Nota de Segurança do Protótipo */}
        <View className="flex-row items-center justify-center mt-1">
          <MaterialIcons name="lock-outline" size={14} color="#757682" />
          <Text className="text-[11px] text-on-surface-variant/80 ml-1.5">
            Seus dados e progresso espiritual protegidos com segurança
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
