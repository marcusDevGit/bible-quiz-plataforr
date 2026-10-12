import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { socket } from "@/services/socket";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";

export default function LobbyScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams();
  const [room, setRoom] = useState<any>(null);

  const { data: profileData } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: () => authService.getProfile(),
  });
  const loggedUser = profileData?.user;

  useEffect(() => {
    // Se o socket estiver desconectado (ex: recarga de hot-reload), reconecta
    if (!socket.connected) {
      socket.connect();
      if (loggedUser && code) {
        socket.emit("join_room", {
          code: String(code),
          userId: loggedUser.id,
          name: loggedUser.name,
          avatar: loggedUser.avatar,
        });
      }
    }

    // Escuta atualizações da sala
    socket.on("room_updated", (updatedRoom: any) => {
      if (updatedRoom.code === code) {
        setRoom(updatedRoom);
      }
    });

    // Escuta o início da partida
    socket.on("game_start", (data: any) => {
      router.replace({
        pathname: "/multiplayer/game",
        params: { code: String(code) },
      });
    });

    socket.on("error", (msg: string) => {
      Alert.alert("Aviso", msg);
      router.back();
    });

    return () => {
      socket.off("room_updated");
      socket.off("game_start");
      socket.off("error");
    };
  }, [code, loggedUser]);

  const handleToggleReady = () => {
    socket.emit("toggle_ready", { code });
  };

  const handleLeaveRoom = () => {
    socket.emit("leave_room", { code });
    router.replace("/arena");
  };

  if (!room) {
    return (
      <SafeAreaView className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator size="large" color="#00236f" />
        <Text className="mt-4 text-on-surface-variant font-title-md">
          Conectando ao lobby...
        </Text>
      </SafeAreaView>
    );
  }

  const myPlayer = room.players.find((p: any) => p.userId === loggedUser?.id);
  const otherPlayer = room.players.find((p: any) => p.userId !== loggedUser?.id);

  return (
    <SafeAreaView className="flex-1 bg-surface max-w-md mx-auto w-full px-margin-mobile relative">
      {/* Botão Sair */}
      <View className="flex-row items-center justify-between h-16 mt-4">
        <TouchableOpacity
          onPress={handleLeaveRoom}
          className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-lowest border border-outline-variant/40"
        >
          <MaterialIcons name="close" size={20} color="#444651" />
        </TouchableOpacity>
        <Text className="font-title-md font-bold text-primary">Sala de Espera</Text>
        <View className="w-10" />
      </View>

      {/* Código da sala */}
      <View className="items-center bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 mt-4 mb-6">
        <Text className="font-label-sm text-on-surface-variant text-[11px] uppercase tracking-wider">
          Código de Convite
        </Text>
        <Text className="font-headline-lg text-[32px] font-extrabold text-primary tracking-widest mt-1">
          {room.code}
        </Text>
        <Text className="font-body-sm text-on-surface-variant text-center mt-2 px-2">
          Compartilhe este código com o seu amigo para ele se conectar à partida.
        </Text>
      </View>

      {/* Jogadores conectados */}
      <View className="flex-col gap-4 mb-8">
        {/* Jogador 1 (Criador / Você) */}
        <View className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex-row items-center justify-between shadow-sm">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-primary-container items-center justify-center border-2 border-primary">
              <MaterialIcons name="person" size={24} color="#00236f" />
            </View>
            <View>
              <Text className="font-title-md font-bold text-on-surface">
                {myPlayer ? `${myPlayer.name} (Você)` : "Conectando..."}
              </Text>
              <Text className="font-body-sm text-on-surface-variant">Jogador 1</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1.5 bg-surface-container px-3 py-1 rounded-full border border-outline-variant/20">
            <MaterialIcons
              name={myPlayer?.ready ? "check-circle" : "hourglass-empty"}
              size={16}
              color={myPlayer?.ready ? "#4edea3" : "#757682"}
            />
            <Text
              style={{ color: myPlayer?.ready ? "#005236" : "#444651" }}
              className="font-label-sm font-semibold text-xs"
            >
              {myPlayer?.ready ? "Pronto" : "Aguardando"}
            </Text>
          </View>
        </View>

        {/* Jogador 2 (Oponente) */}
        <View className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex-row items-center justify-between shadow-sm">
          {otherPlayer ? (
            <>
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full bg-secondary-container/20 items-center justify-center border-2 border-secondary">
                  <MaterialIcons name="person" size={24} color="#855300" />
                </View>
                <View>
                  <Text className="font-title-md font-bold text-on-surface">
                    {otherPlayer.name}
                  </Text>
                  <Text className="font-body-sm text-on-surface-variant">Jogador 2</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1.5 bg-surface-container px-3 py-1 rounded-full border border-outline-variant/20">
                <MaterialIcons
                  name={otherPlayer.ready ? "check-circle" : "hourglass-empty"}
                  size={16}
                  color={otherPlayer.ready ? "#4edea3" : "#757682"}
                />
                <Text
                  style={{ color: otherPlayer.ready ? "#005236" : "#444651" }}
                  className="font-label-sm font-semibold text-xs"
                >
                  {otherPlayer.ready ? "Pronto" : "Aguardando"}
                </Text>
              </View>
            </>
          ) : (
            <View className="flex-row items-center justify-center w-full py-4 gap-3">
              <ActivityIndicator size="small" color="#757682" />
              <Text className="font-body-md text-on-surface-variant">
                Aguardando oponente...
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Botões de Ação */}
      <View className="absolute bottom-10 left-5 right-5">
        <TouchableOpacity
          onPress={handleToggleReady}
          className={`w-full py-4 rounded-full flex-row items-center justify-center gap-2 border-2 ${
            myPlayer?.ready
              ? "border-secondary bg-secondary-container"
              : "border-primary bg-primary"
          }`}
        >
          <MaterialIcons
            name={myPlayer?.ready ? "cancel" : "check"}
            size={20}
            color={myPlayer?.ready ? "#684000" : "#ffffff"}
          />
          <Text
            className={`font-label-lg font-bold text-sm ${
              myPlayer?.ready ? "text-on-secondary-container" : "text-white"
            }`}
          >
            {myPlayer?.ready ? "Cancelar Pronto" : "Estou Pronto"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
