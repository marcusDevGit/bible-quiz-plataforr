import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";
import { socket } from "@/services/socket";

import { CreateRoomModal } from "@/features/multiplayer/components/CreateRoomModal";
import { MatchmakingModal } from "@/features/multiplayer/components/MatchmakingModal";
import { QuickMatchCard } from "@/features/multiplayer/components/QuickMatchCard";

export default function ArenaRoute() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [connecting, setConnecting] = useState(false);

  // Estados dos modais de matchmaking e temas
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [searchStatusMsg, setSearchStatusMsg] = useState("Procurando oponente...");
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [activeRoomsCount, setActiveRoomsCount] = useState<number>(0);

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

    socket.emit("get_arena_stats");

    socket.on(
      "arena_stats",
      (stats: { onlineCount?: number; activeRooms?: number; queueCount?: number }) => {
        if (typeof stats?.onlineCount === "number") {
          setOnlineCount(Math.max(1, stats.onlineCount));
        }
        if (typeof stats?.activeRooms === "number") {
          setActiveRoomsCount(stats.activeRooms);
        }
      },
    );

    socket.on("connect", () => {
      socket.emit("get_arena_stats");
    });

    socket.on("room_created", (room: any) => {
      setConnecting(false);
      setIsCreateModalVisible(false);
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

    socket.on("quick_match_found", (data: { code: string, room: any }) => {
      setIsSearchingMatch(false);
      router.push({
        pathname: "/multiplayer/game",
        params: { code: data.code },
      });
    });

    socket.on("searching_match", (data: { message: string }) => {
      setSearchStatusMsg(data.message)
    })

    socket.on("error", (msg: string) => {
      setConnecting(false);
      setIsSearchingMatch(false)
      Alert.alert("Aviso", msg);
    });

    return () => {
      socket.off("arena_stats");
      socket.off("room_created");
      socket.off("room_updated");
      socket.off("quick_match_found")
      socket.off("searching_match")
      socket.off("error");
    };
  }, []);

  // 1. Iniciar Busca de Partida Rápida
  const handleStartQuickMatch = () => {
    if (!loggedUser) return;
    setIsSearchingMatch(true);
    setSearchStatusMsg("Procurando oponente do seu nível...");
    socket.emit("find_quick_match", {
      userId: loggedUser.id,
      name: loggedUser.name,
      avatar: loggedUser.avatar,
      level: loggedUser.level || 1,
    });
  };
  // 2. Cancelar Busca
  const handleCancelQuickMatch = () => {
    setIsSearchingMatch(false);
    socket.emit("cancel_quick_match");
  };

  const handleCreateRoom = (theme: string) => {
    if (!loggedUser) return;
    setConnecting(true);
    socket.emit("create_room", {
      userId: loggedUser.id,
      name: loggedUser.name,
      avatar: loggedUser.avatar,
      level: loggedUser.level || 1,
      theme,
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Indicador de Status Online */}
        <View className="flex-1 w-full max-w-2xl mx-auto px-margin-mobile">
          <View className="items-center mt-6">
            <View
              style={{ backgroundColor: "rgba(39, 195, 138, 0.1)" }}
              className="flex-row items-center gap-2 px-4 py-1.5 rounded-full border border-on-tertiary-container/25"
            >
              <View className="w-2.5 h-2.5 rounded-full bg-on-tertiary-container animate-pulse" />
              <Text className="text-on-tertiary-container font-semibold text-xs">
                {onlineCount === 1
                  ? "1 jogador online na Arena agora"
                  : `${onlineCount.toLocaleString("pt-BR")} jogadores online agora`}
                {activeRoomsCount > 0 ? ` • ${activeRoomsCount} salas ativas` : ""}
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
            <QuickMatchCard onPress={handleStartQuickMatch} />
            {/* Opção: Criar Sala */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setIsCreateModalVisible(true)}
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
                  Escolha um tema bíblico e convide amigos.
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#757682" />
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
      </ScrollView>
      {/* Modal de Matchmaking */}
      <MatchmakingModal
        visible={isSearchingMatch}
        userLevel={loggedUser?.level || 1}
        statusMessage={searchStatusMsg}
        onCancel={handleCancelQuickMatch}
      />
      {/* Modal de Escolha de Tema */}
      <CreateRoomModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onConfirm={handleCreateRoom}
      />

    </SafeAreaView>
  );
}
