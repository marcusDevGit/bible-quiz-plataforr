import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { authService } from "@/features/auth/services/auth.service";
import { rankingService } from "@/features/ranking/services/ranking.service";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const TOPBAR_HEIGHT = 64;

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editError, setEditError] = useState("");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const {
    data: profileData,
    refetch: refetchProfile,
    isRefetching: isRefetchingProfile,
  } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: () => authService.getProfile(),
  });

  const {
    data: ranking = [],
    refetch: refetchRanking,
    isRefetching: isRefetchingRanking,
  } = useQuery({
    queryKey: ["ranking"],
    queryFn: () => rankingService.getGlobalRanking(),
  });

  const isRefreshing = isRefetchingProfile || isRefetchingRanking;
  const handleRefresh = () => {
    refetchProfile();
    refetchRanking();
  };

  const loggedUser = profileData?.user;
  const loggedUserRank = ranking.find((p) => p.id === loggedUser?.id);

  const userPoints =
    loggedUser?.stats?.points ?? loggedUser?.points ?? loggedUserRank?.points ?? 0;
  const XP_PER_LEVEL = 200;
  const currentLevel = loggedUser?.level ?? Math.floor(userPoints / XP_PER_LEVEL) + 1;
  const currentXPInLevel = userPoints % XP_PER_LEVEL;
  const progressPercent = Math.min(100, Math.round((currentXPInLevel / XP_PER_LEVEL) * 100));

  const totalMatches =
    loggedUser?.stats?.totalMatches ??
    loggedUser?.matchesPlayed ??
    loggedUser?._count?.matchesAsPlayerOne ??
    0;
  const totalWins = loggedUser?.stats?.wins ?? 0;
  const accuracyPercent = loggedUser?.stats?.accuracy ?? 0;
  const recentMatches: any[] = Array.isArray(loggedUser?.recentMatches)
    ? loggedUser.recentMatches
    : [];

  const formatMatchDate = (dateStr?: string) => {
    if (!dateStr) return "Recente";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "Recente";
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Há ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const formattedMemberSince = loggedUser?.createdAt
    ? `Membro desde ${new Date(loggedUser.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}`
    : loggedUser?.email ?? "Membro BibleQuest";

  const router = useRouter();

  useEffect(() => {
    if (loggedUser && isEditModalVisible) {
      setEditName(loggedUser.name || "");
      setEditAvatar(loggedUser.avatar || "");
      setEditPassword("");
      setEditError("");
    }
  }, [loggedUser, isEditModalVisible]);

  const updateProfileMutation = useMutation({
    mutationFn: (payload: {
      name?: string;
      avatar?: string | null;
      password?: string;
    }) => authService.updateProfile(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] }),
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
        queryClient.invalidateQueries({ queryKey: ["ranking"] }),
      ]);
      setIsEditModalVisible(false);
      setProfileSuccessMsg("Seu perfil foi atualizado com sucesso!");
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      successTimeoutRef.current = setTimeout(() => {
        setProfileSuccessMsg("");
      }, 4000);
      if (Platform.OS !== "web") {
        Alert.alert("Sucesso", "Seu perfil foi atualizado com sucesso!");
      }
    },
    onError: (err: any) => {
      setEditError(err?.message || "Erro ao atualizar perfil.");
    },
  });

  const handleSaveProfile = () => {
    setEditError("");
    const trimmedName = editName.trim();
    if (trimmedName.length < 3) {
      setEditError("O nome deve ter pelo menos 3 caracteres.");
      return;
    }
    if (editPassword.trim().length > 0 && editPassword.trim().length < 6) {
      setEditError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    const payload: { name: string; avatar: string | null; password?: string } = {
      name: trimmedName,
      avatar: editAvatar.trim() || null,
    };
    if (editPassword.trim().length >= 6) {
      payload.password = editPassword.trim();
    }

    updateProfileMutation.mutate(payload);
  };

  const handleLogout = async () => {
    setIsSettingsModalVisible(false);
    await authService.logout();
    queryClient.clear();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fb" }}>
      {/* TopAppBar - Conforme Protótipo */}
      <View
        style={{ height: TOPBAR_HEIGHT }}
        className="flex-row justify-between items-center px-5 h-16 w-full bg-surface border-b border-outline-variant/30"
      >
        <Text className="text-title-md font-title-md font-bold text-primary">
          BibleQuest
        </Text>
        <View className="flex-row items-center gap-1 bg-secondary-container/10 px-3 py-1.5 rounded-full">
          <Text className="text-sm">🔥</Text>
          <Text className="text-primary font-bold text-sm"> {loggedUser?.currentStreak || 1} Dias</Text>
        </View>
      </View>

      {/* Área de Rolagem do Conteúdo */}
      <View style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#00236f"]}
              tintColor="#00236f"
            />
          }
        >
          <View className="px-5 gap-6">
            {profileSuccessMsg ? (
              <View
                style={{
                  backgroundColor: "#f0fdf4",
                  borderColor: "#86efac",
                  borderWidth: 1,
                }}
                className="rounded-xl p-3 flex-row items-center gap-2"
              >
                <MaterialIcons name="check-circle" size={18} color="#16a34a" />
                <Text style={{ color: "#15803d" }} className="text-xs font-bold flex-1">
                  {profileSuccessMsg}
                </Text>
              </View>
            ) : null}
            {/* Cabeçalho do Perfil & Barra de XP */}
            <View className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 items-center">
              <View style={{ width: 96, height: 96 }} className="relative mb-3">
                {loggedUser?.avatar ? (
                  <Image
                    source={{ uri: loggedUser.avatar }}
                    style={{ width: 96, height: 96, borderRadius: 48 }}
                    className="border-4 border-surface-container-lowest shadow-sm"
                  />
                ) : (
                  <View
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 48,
                      backgroundColor: "#eceef0",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    className="border-4 border-surface-container-lowest shadow-sm"
                  >
                    <MaterialIcons name="person" size={48} color="#00236f" />
                  </View>
                )}
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: "#ffffff",
                    backgroundColor: "#fea619", // secondary-container
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text className="text-on-secondary-container text-xs font-bold">
                    {currentLevel}
                  </Text>
                </View>
              </View>

              <Text className="text-headline-md font-bold text-on-surface mb-1">
                {loggedUser?.name || "Jogador"}
              </Text>
              <Text className="text-body-md text-on-surface-variant mb-4">
                {formattedMemberSince}
              </Text>

              {/* Barra de Progresso de XP */}
              <View className="w-full bg-surface-container-high rounded-full h-3 mb-2 overflow-hidden">
                <View
                  style={{ width: `${progressPercent}%` }}
                  className="bg-primary h-full rounded-full"
                />
              </View>

              <View className="w-full flex-row justify-between">
                <Text className="text-xs font-medium text-on-surface-variant">
                  Nível {currentLevel}
                </Text>
                <Text className="text-xs font-medium text-on-surface-variant">
                  {currentXPInLevel} / {XP_PER_LEVEL} XP
                </Text>
              </View>
            </View>

            {/* Estatísticas (Grid Bento) */}
            <View>
              <Text className="text-title-md font-bold text-on-surface mb-3">
                Estatísticas
              </Text>
              <View className="gap-4">
                {/* Linha 1 */}
                <View className="flex-row gap-4">
                  <View className="flex-1 bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30">
                    <MaterialIcons
                      name="sports-esports"
                      size={24}
                      color="#00236f"
                      className="mb-2"
                    />
                    <Text className="text-headline-md font-bold text-on-surface">
                      {totalMatches}
                    </Text>
                    <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
                      Partidas ({totalWins} vitórias)
                    </Text>
                  </View>
                  <View className="flex-1 bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30">
                    <MaterialIcons
                      name="emoji-events"
                      size={24}
                      color="#fea619"
                      className="mb-2"
                    />
                    <Text className="text-headline-md font-bold text-on-surface">
                      {userPoints}
                    </Text>
                    <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
                      XP Total
                    </Text>
                  </View>
                </View>
                {/* Linha 2 */}
                <View className="flex-row gap-4">
                  <View className="flex-1 bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30">
                    <MaterialIcons
                      name="leaderboard"
                      size={24}
                      color="#4edea3"
                      className="mb-2"
                    />
                    <Text className="text-headline-md font-bold text-on-surface">
                      {loggedUserRank ? `#${loggedUserRank.position}` : "-"}
                    </Text>
                    <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
                      Posição Global
                    </Text>
                  </View>
                  <View className="flex-1 bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30">
                    <MaterialIcons
                      name="track-changes"
                      size={24}
                      color="#00236f"
                      className="mb-2"
                    />
                    <Text className="text-headline-md font-bold text-on-surface">
                      {accuracyPercent}%
                    </Text>
                    <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
                      Precisão Geral
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Atividade Recente */}
            <View>
              <Text className="text-title-md font-bold text-on-surface mb-3">
                Atividade Recente
              </Text>
              {recentMatches.length === 0 ? (
                <View className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 items-center">
                  <View className="w-12 h-12 rounded-full bg-primary-container/10 items-center justify-center mb-2">
                    <MaterialIcons name="menu-book" size={24} color="#00236f" />
                  </View>
                  <Text className="font-bold text-on-surface text-sm text-center">
                    Nenhuma partida registrada ainda
                  </Text>
                  <Text className="text-on-surface-variant text-xs text-center mt-1 mb-3">
                    Jogue sua primeira partida para acompanhar seu histórico de estudos e batalhas!
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/quiz")}
                    className="bg-primary px-5 py-2.5 rounded-full flex-row items-center gap-1.5"
                  >
                    <MaterialIcons name="play-arrow" size={16} color="#ffffff" />
                    <Text className="text-white font-bold text-xs">
                      Jogar Primeira Partida
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="gap-2">
                  {recentMatches.map((match: any) => {
                    const isMultiplayer = Boolean(match.playerTwo);
                    const isPlayerOne = match.playerOne === loggedUser?.id;
                    const opponentName = isPlayerOne
                      ? match.user2?.name || "Oponente"
                      : match.user1?.name || "Oponente";
                    const isWinner = match.winner && match.winner === loggedUser?.id;
                    const matchScore = Number(match.score) || 0;
                    const questionCount = match._count?.questions || 10;
                    const soloXp = matchScore;
                    const correctCount =
                      match.correctAnswers ?? Math.round(matchScore / 15);

                    return (
                      <View
                        key={match.id}
                        className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-outline-variant/30 flex-row items-center gap-3"
                      >
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            flexShrink: 0,
                          }}
                          className={
                            isMultiplayer
                              ? "bg-secondary-container/15 items-center justify-center"
                              : "bg-primary-container/10 items-center justify-center"
                          }
                        >
                          <MaterialIcons
                            name={isMultiplayer ? "sports-esports" : "menu-book"}
                            size={20}
                            color={isMultiplayer ? "#fea619" : "#00236f"}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="font-bold text-on-surface text-sm">
                            {isMultiplayer
                              ? `Arena 1v1 vs ${opponentName}`
                              : "Quiz Individual"}
                          </Text>
                          <Text className="text-on-surface-variant text-[10px] mt-0.5">
                            {formatMatchDate(match.createdAt)}
                          </Text>
                        </View>
                        <View className="items-end">
                          {isMultiplayer ? (
                            <>
                              <Text
                                style={{
                                  color: isWinner ? "#15803d" : "#855300",
                                  fontSize: 12,
                                  fontWeight: "bold",
                                }}
                              >
                                {isWinner ? "Vitória" : "Derrota"}
                              </Text>
                              <Text className="text-[10px] text-on-surface-variant mt-0.5">
                                {isWinner ? `+${matchScore} XP` : `${matchScore} pts`}
                              </Text>
                            </>
                          ) : (
                            <>
                              <Text
                                style={{
                                  color: "#15803d",
                                  fontSize: 12,
                                  fontWeight: "bold",
                                }}
                              >
                                +{soloXp} XP
                              </Text>
                              <Text className="text-[10px] text-on-surface-variant mt-0.5">
                                {correctCount}/{questionCount} Acertos
                              </Text>
                            </>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Botões de Ação */}
            <View className="gap-3 mt-4">
              <TouchableOpacity
                onPress={() => router.push("/achievements")}
                className="w-full bg-primary h-12 rounded-full flex-row items-center justify-center gap-2"
              >
                <MaterialIcons name="emoji-events" size={20} color="#ffffff" />
                <Text className="text-white font-bold text-sm">
                  Ver Conquistas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsEditModalVisible(true)}
                className="w-full bg-surface-container-high h-12 rounded-full flex-row items-center justify-center gap-2"
              >
                <MaterialIcons name="edit" size={20} color="#191c1e" />
                <Text className="text-on-surface font-bold text-sm">
                  Editar Perfil
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsSettingsModalVisible(true)}
                className="w-full bg-surface-container-high h-12 rounded-full flex-row items-center justify-center gap-2"
              >
                <MaterialIcons name="settings" size={20} color="#191c1e" />
                <Text className="text-on-surface font-bold text-sm">
                  Configurações
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                className="w-full border border-error h-12 rounded-full flex-row items-center justify-center gap-2 mt-2"
              >
                <MaterialIcons name="logout" size={20} color="#ba1a1a" />
                <Text className="text-error font-bold text-sm">Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Modal de Editar Perfil */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#ffffff",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              maxWidth: 540,
              width: "100%",
              alignSelf: "center",
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-primary">
                Editar Perfil
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                className="w-9 h-9 rounded-full bg-surface-container-low items-center justify-center"
              >
                <MaterialIcons name="close" size={20} color="#444651" />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-xs font-bold text-on-surface mb-1.5">
                  Nome de Exibição
                </Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Seu nome"
                  placeholderTextColor="#757682"
                  className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface text-sm"
                />
              </View>

              <View>
                <Text className="text-xs font-bold text-on-surface mb-1.5">
                  URL do Avatar (opcional)
                </Text>
                <TextInput
                  value={editAvatar}
                  onChangeText={setEditAvatar}
                  placeholder="https://exemplo.com/sua-foto.jpg"
                  placeholderTextColor="#757682"
                  autoCapitalize="none"
                  className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface text-sm"
                />
              </View>

              <View>
                <Text className="text-xs font-bold text-on-surface mb-1.5">
                  Nova Senha (deixe em branco para manter)
                </Text>
                <TextInput
                  value={editPassword}
                  onChangeText={setEditPassword}
                  placeholder="Mínimo de 6 caracteres"
                  placeholderTextColor="#757682"
                  secureTextEntry
                  className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface text-sm"
                />
              </View>

              {editError ? (
                <View className="bg-error-container/40 p-2.5 rounded-lg flex-row items-center">
                  <MaterialIcons
                    name="error-outline"
                    size={18}
                    color="#ba1a1a"
                  />
                  <Text className="text-error text-xs font-medium ml-2 flex-1">
                    {editError}
                  </Text>
                </View>
              ) : null}

              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity
                  onPress={() => setIsEditModalVisible(false)}
                  disabled={updateProfileMutation.isPending}
                  className="flex-1 py-3.5 rounded-xl border border-outline-variant items-center justify-center"
                >
                  <Text className="text-on-surface-variant font-bold text-sm">
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  className="flex-1 py-3.5 rounded-xl bg-primary flex-row items-center justify-center gap-2"
                >
                  {updateProfileMutation.isPending ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : null}
                  <Text className="text-white font-bold text-sm">
                    Salvar Alterações
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Configurações */}
      <Modal
        visible={isSettingsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSettingsModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 24,
              padding: 24,
              maxWidth: 420,
              width: "100%",
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-primary">
                Configurações
              </Text>
              <TouchableOpacity
                onPress={() => setIsSettingsModalVisible(false)}
                className="w-9 h-9 rounded-full bg-surface-container-low items-center justify-center"
              >
                <MaterialIcons name="close" size={20} color="#444651" />
              </TouchableOpacity>
            </View>

            <View className="gap-3 mb-6">
              <TouchableOpacity
                onPress={() => setDailyReminders((prev) => !prev)}
                className="flex-row items-center justify-between p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30"
              >
                <View className="flex-row items-center gap-3">
                  <MaterialIcons
                    name="notifications-active"
                    size={22}
                    color="#00236f"
                  />
                  <View>
                    <Text className="font-bold text-on-surface text-sm">
                      Lembrete de Ofensiva Diária
                    </Text>
                    <Text className="text-xs text-on-surface-variant">
                      Avisar para manter o streak ativo
                    </Text>
                  </View>
                </View>
                <MaterialIcons
                  name={dailyReminders ? "toggle-on" : "toggle-off"}
                  size={34}
                  color={dailyReminders ? "#00236f" : "#757682"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSoundEffects((prev) => !prev)}
                className="flex-row items-center justify-between p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30"
              >
                <View className="flex-row items-center gap-3">
                  <MaterialIcons name="volume-up" size={22} color="#00236f" />
                  <View>
                    <Text className="font-bold text-on-surface text-sm">
                      Efeitos Visuais e Sonoros
                    </Text>
                    <Text className="text-xs text-on-surface-variant">
                      Feedback durante as partidas
                    </Text>
                  </View>
                </View>
                <MaterialIcons
                  name={soundEffects ? "toggle-on" : "toggle-off"}
                  size={34}
                  color={soundEffects ? "#00236f" : "#757682"}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              className="w-full border border-error py-3.5 rounded-xl flex-row items-center justify-center gap-2 mb-2"
            >
              <MaterialIcons name="logout" size={18} color="#ba1a1a" />
              <Text className="text-error font-bold text-sm">
                Encerrar Sessão
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsSettingsModalVisible(false)}
              className="w-full py-3 rounded-xl items-center justify-center"
            >
              <Text className="text-on-surface-variant font-semibold text-sm">
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
