import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { authService } from "@/features/auth/services/auth.service";
import { rankingService } from "@/features/ranking/services/ranking.service";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

const TOPBAR_HEIGHT = 64;
const TABBAR_HEIGHT = 65;

export default function ProfileScreen() {
  const { data: profileData } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: () => authService.getProfile(),
  });

  const { data: ranking = [] } = useQuery({
    queryKey: ["ranking"],
    queryFn: () => rankingService.getGlobalRanking(),
  });

  const loggedUser = profileData?.user;
  const loggedUserRank = ranking.find((p) => p.id === loggedUser?.id);

  const userPoints = loggedUser?.points ?? loggedUserRank?.points ?? 0;
  const XP_PER_LEVEL = 200;
  const currentLevel = loggedUser?.level ?? Math.floor(userPoints / XP_PER_LEVEL) + 1;
  const currentXPInLevel = userPoints % XP_PER_LEVEL;
  const progressPercent = Math.min(100, Math.round((currentXPInLevel / XP_PER_LEVEL) * 100));

  const formattedMemberSince = loggedUser?.createdAt
    ? `Membro desde ${new Date(loggedUser.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}`
    : loggedUser?.email ?? "Membro BibleQuest";

  const router = useRouter();
  const { height } = useWindowDimensions();
  const scrollAreaHeight = height - TOPBAR_HEIGHT - TABBAR_HEIGHT;

  const handleLogout = async () => {
    await authService.logout();
    router.replace("/login");
  };

  return (
    // SafeAreaView com limitação de container para centralizar no browser
    <View style={{ flex: 1, backgroundColor: "#f7f9fb" }}>
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
      <View style={{ flex: 1, minHeight: scrollAreaHeight }}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}
        >
          <View className="px-5 gap-6">
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
                      {loggedUser?.matchesPlayed ?? loggedUser?._count?.matchesAsPlayerOne ?? 0}
                    </Text>
                    <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
                      Partidas
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
                      name="local-fire-department"
                      size={24}
                      color="#b6c4ff"
                      className="mb-2"
                    />
                    <Text className="text-headline-md font-bold text-on-surface">
                      {loggedUser?.bestStreak ?? loggedUser?.currentStreak ?? 1}
                    </Text>
                    <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
                      Melhor Streak
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
              <View className="gap-2">
                {/* Item 1 */}
                <View className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-outline-variant/30 flex-row items-center gap-3">
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      flexShrink: 0,
                    }}
                    className="bg-primary-container/10 items-center justify-center"
                  >
                    <MaterialIcons name="book" size={20} color="#00236f" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-on-surface text-sm">
                      O Êxodo
                    </Text>
                    <Text className="text-on-surface-variant text-[10px] mt-0.5">
                      Há 2 horas
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text
                      style={{
                        color: "#4edea3",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      +45 XP
                    </Text>
                    <Text className="text-[10px] text-on-surface-variant mt-0.5">
                      9/10 Acertos
                    </Text>
                  </View>
                </View>

                {/* Item 2 */}
                <View className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-outline-variant/30 flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-secondary-container/10 items-center justify-center">
                    <MaterialIcons
                      name="sports-esports"
                      size={20}
                      color="#fea619"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-on-surface text-sm">
                      Arena: Davi vs Golias
                    </Text>
                    <Text className="text-on-surface-variant text-[10px] mt-0.5">
                      Ontem
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text
                      style={{
                        color: "#855300",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      Vitória
                    </Text>
                    <Text className="text-[10px] text-on-surface-variant mt-0.5">
                      +120 XP
                    </Text>
                  </View>
                </View>

                {/* Item 3 */}
                <View className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-outline-variant/30 flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-primary-container/10 items-center justify-center">
                    <MaterialIcons name="menu-book" size={20} color="#00236f" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-on-surface text-sm">
                      Parábolas de Jesus
                    </Text>
                    <Text className="text-on-surface-variant text-[10px] mt-0.5">
                      2 dias atrás
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs font-bold text-on-tertiary-container">
                      +30 XP
                    </Text>
                    <Text className="text-[10px] text-on-surface-variant mt-0.5">
                      6/10 Acertos
                    </Text>
                  </View>
                </View>
              </View>
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

              <TouchableOpacity className="w-full bg-surface-container-high h-12 rounded-full flex-row items-center justify-center gap-2">
                <MaterialIcons name="edit" size={20} color="#191c1e" />
                <Text className="text-on-surface font-bold text-sm">
                  Editar Perfil
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="w-full bg-surface-container-high h-12 rounded-full flex-row items-center justify-center gap-2">
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
    </View>
  );
}
