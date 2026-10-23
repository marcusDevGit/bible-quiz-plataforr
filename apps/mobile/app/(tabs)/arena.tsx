import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";
import { socket } from "@/services/socket";
import React from "react";

export default function ArenaRoute() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [connecting, setConnecting] = useState(false);

  // Busca dados do usuário logado para enviar ao socket
  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: () => authService.getProfile(),
  });
  const loggedUser = profileData?.user;

  useEffect(() => {
    // Conecta o socket ao abrir a tela da Arena
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("room_created", (room: any) => {
      setConnecting(false);
      router.push({
        pathname: "/multiplayer/lobby",
        params: { code: room.code },
      });
    });

    socket.on("room_updated", (room: any) => {
      setConnecting(false);
      router.push({
        pathname: "/multiplayer/lobby",
        params: { code: room.code },
      });
    });

    socket.on("error", (msg: string) => {
      setConnecting(false);
      Alert.alert("Aviso", msg);
    });

    return () => {
      socket.off("room_created");
      socket.off("room_updated");
      socket.off("error");
    };
  }, []);

  const handleCreateRoom = () => {
    if (!loggedUser) return;
    setConnecting(true);
    socket.emit("create_room", {
      userId: loggedUser.id,
      name: loggedUser.name,
      avatar: loggedUser.avatar,
    });
  };

  const handleJoinRoom = () => {
    if (!loggedUser) return;
    if (!roomCode || roomCode.trim().length !== 6) {
      Alert.alert("Aviso", "Por favor, digite um código válido com 6 caracteres.");
      return;
    }
    setConnecting(true);
    socket.emit("join_room", {
      code: roomCode.trim().toUpperCase(),
      userId: loggedUser.id,
      name: loggedUser.name,
      avatar: loggedUser.avatar,
    });
  };

  if (loadingProfile || connecting) {
    return (
      <SafeAreaView className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator size="large" color="#00236f" />
        <Text className="mt-4 text-on-surface-variant font-title-md">
          {connecting ? "Conectando à partida..." : "Carregando perfil..."}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface w-full">
      {/* Indicador de Status Online */}
      <View className="flex-1 w-full max-w-2xl mx-auto px-margin-mobile">
        <View className="items-center mt-6">
          <View
            style={{ backgroundColor: "rgba(39, 195, 138, 0.1)" }}
            className="flex-row items-center gap-2 px-4 py-1.5 rounded-full border border-on-tertiary-container/25"
          >
            <View className="w-2.5 h-2.5 rounded-full bg-on-tertiary-container animate-pulse" />
            <Text className="text-on-tertiary-container font-semibold text-xs">
              1.240 jogadores online agora
            </Text>
          </View>
        </View>

        {/* Cabeçalho principal */}
        <View className="items-center mt-6 mb-8">
          <MaterialIcons name="sports-esports" size={64} color="#fea619" />
          <Text className="font-headline-lg font-bold text-primary mt-2">
            Arena Multiplayer
          </Text>
          <Text className="font-body-md text-on-surface-variant text-center mt-2 px-4">
            Desafie amigos ou jogue contra a comunidade para testar seus conhecimentos bíblicos.
          </Text>
        </View>

        {/* Grid de Opções Bento Style */}
        <View className="flex-col gap-4">
          {/* Opção: Criar Sala */}
          <TouchableOpacity
            onPress={handleCreateRoom}
            className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 flex-row items-center gap-4 shadow-sm"
            style={{
              shadowColor: "#00236f",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <View className="w-12 h-12 rounded-full bg-secondary-container/20 items-center justify-center">
              <MaterialIcons name="group-add" size={28} color="#855300" />
            </View>
            <View className="flex-1">
              <Text className="font-title-md font-bold text-on-surface">
                Criar Sala Privada
              </Text>
              <Text className="font-body-sm text-on-surface-variant mt-0.5">
                Convide amigos para uma partida exclusiva.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Opção: Entrar por Código */}
          <View
            className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm"
            style={{
              shadowColor: "#00236f",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center gap-4 mb-3">
              <View className="w-12 h-12 rounded-full bg-tertiary-container/10 items-center justify-center">
                <MaterialIcons name="pin" size={26} color="#004a31" />
              </View>
              <View className="flex-1">
                <Text className="font-title-md font-bold text-on-surface">
                  Entrar com Código
                </Text>
                <Text className="font-body-sm text-on-surface-variant mt-0.5">
                  Insira o código de convite de uma sala existente.
                </Text>
              </View>
            </View>

            {/* Campo de Código */}
            <View className="flex-row gap-2 mt-1">
              <TextInput
                value={roomCode}
                onChangeText={setRoomCode}
                placeholder="Ex: ABC123"
                placeholderTextColor="#757682"
                autoCapitalize="characters"
                maxLength={6}
                className="flex-1 bg-surface border border-outline-variant rounded-xl px-4 py-3 font-bold text-on-surface text-center uppercase"
              />
              <TouchableOpacity
                onPress={handleJoinRoom}
                className="bg-primary rounded-xl px-5 items-center justify-center"
              >
                <MaterialIcons name="arrow-forward" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
