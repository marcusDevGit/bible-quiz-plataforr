import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import { Achievement, Rarity, achievementsService } from "../services/achievements.service";

// ─── Paleta de cores por raridade ───────────────────────────────────────────
// Cada nível tem: anel externo, fundo interno, cor do ícone e label
const RARITY_STYLES: Record<
  Rarity,
  { ring: string; bg: string; icon: string; label: string; labelColor: string }
> = {
  COMMON:    { ring: "#c5c5d3", bg: "#f2f4f6", icon: "#757682", label: "Comum",     labelColor: "#757682" },
  UNCOMMON:  { ring: "#4edea3", bg: "#e6fff5", icon: "#00311f", label: "Incomum",   labelColor: "#00311f" },
  RARE:      { ring: "#b6c4ff", bg: "#dce1ff", icon: "#00236f", label: "Raro",      labelColor: "#00236f" },
  EPIC:      { ring: "#cf89ff", bg: "#f3e8ff", icon: "#6b21a8", label: "Épico",     labelColor: "#6b21a8" },
  LEGENDARY: { ring: "#fea619", bg: "#fff4e0", icon: "#684000", label: "Lendário",  labelColor: "#684000" },
  MYTHIC:    { ring: "#ff6f6f", bg: "#fff0f0", icon: "#93000a", label: "Mítico",    labelColor: "#93000a" },
};

// ─── Mapa de ícones por código de conquista ──────────────────────────────────
// Fallback: "military-tech"
const ICON_MAP: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  FIRST_STEP:         "verified",
  MASTER_GOSPELS:     "menu-book",
  WISDOM_OF_SOLOMON:  "auto-awesome",
  PROPHET_OF_NATIONS: "public",
  THIRTY_DAY_STREAK:  "local-fire-department",
};

// ─── Componente de card de conquista ────────────────────────────────────────
function AchievementCard({ item }: { item: Achievement }) {
  const isUnlocked = !!item.unlockedAt;
  const style = RARITY_STYLES[item.rarity] ?? RARITY_STYLES.COMMON;
  const iconName = ICON_MAP[item.code] ?? "military-tech";

  // Calcula percentual de progresso para conquistas graduais (ainda não desbloqueadas)
  const hasProgress = !isUnlocked && item.progress != null && item.goal != null;
  const progressPercent = hasProgress
    ? Math.min(100, Math.round((item.progress! / item.goal!) * 100))
    : 0;

  return (
    <View
      className={`rounded-2xl p-4 flex flex-col items-center text-center mb-0 border relative overflow-hidden ${
        isUnlocked
          ? "bg-surface-container-lowest border-outline-variant/40"
          : "bg-surface-container-low border-outline-variant/20 opacity-75"
      }`}
      style={{
        shadowColor: "#00236f",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: isUnlocked ? 2 : 0,
      }}
    >
      {/* Badge de estrela — apenas conquistas desbloqueadas */}
      {isUnlocked && (
        <MaterialIcons
          name="star"
          size={16}
          color={style.icon}
          style={{ position: "absolute", top: 8, right: 8 }}
        />
      )}

      {/* Medalha circular */}
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          borderWidth: 3,
          borderColor: isUnlocked ? style.ring : "#c5c5d3",
          backgroundColor: isUnlocked ? style.bg : "#eceef0",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <MaterialIcons
          name={iconName}
          size={34}
          color={isUnlocked ? style.icon : "#9e9e9e"}
        />
        {/* Cadeado para conquistas bloqueadas */}
        {!isUnlocked && (
          <View
            style={{
              position: "absolute",
              bottom: -4,
              right: -4,
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: "#eceef0",
              borderWidth: 1,
              borderColor: "#c5c5d3",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="lock" size={12} color="#757682" />
          </View>
        )}
      </View>

      {/* Título */}
      <Text
        className={`font-title-md text-center leading-tight mb-1 ${
          isUnlocked ? "text-on-surface" : "text-on-surface-variant"
        }`}
        numberOfLines={2}
        style={{ fontSize: 13, fontWeight: "600" }}
      >
        {item.title}
      </Text>

      {/* Descrição */}
      <Text
        className="text-on-surface-variant text-center"
        numberOfLines={2}
        style={{ fontSize: 11, lineHeight: 15 }}
      >
        {item.description}
      </Text>

      {/* Badge de raridade */}
      <View
        className="mt-2 px-2 py-0.5 rounded-full"
        style={{ backgroundColor: isUnlocked ? style.bg : "#eceef0" }}
      >
        <Text style={{ fontSize: 9, fontWeight: "700", color: isUnlocked ? style.labelColor : "#9e9e9e" }}>
          {style.label.toUpperCase()}
        </Text>
      </View>

      {/* Barra de progresso — apenas conquistas em andamento */}
      {hasProgress && (
        <View className="w-full mt-3">
          <View className="flex-row justify-between mb-1">
            <Text style={{ fontSize: 9, color: "#757682" }}>Progresso</Text>
            <Text style={{ fontSize: 9, color: "#757682" }}>
              {item.progress}/{item.goal}
            </Text>
          </View>
          <View className="w-full bg-surface-variant rounded-full overflow-hidden" style={{ height: 5 }}>
            <View
              className="h-full rounded-full"
              style={{ width: `${progressPercent}%`, backgroundColor: "#4059aa" }}
            />
          </View>
        </View>
      )}

      {/* XP Reward — somente desbloqueadas */}
      {isUnlocked && (
        <Text
          className="mt-2"
          style={{ fontSize: 10, color: "#855300", fontWeight: "700" }}
        >
          +{item.xpReward} XP
        </Text>
      )}
    </View>
  );
}

// ─── Tela principal ──────────────────────────────────────────────────────────
export default function AchievementsScreen() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["myAchievements"],
    queryFn: () => achievementsService.getMyAchievements(),
  });

  const achievements = data?.achievements ?? [];
  const unlocked = achievements.filter((a) => !!a.unlockedAt);
  const locked   = achievements.filter((a) => !a.unlockedAt);

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#00236f" />
        <Text className="mt-4 text-on-surface-variant font-title-md">
          Carregando conquistas...
        </Text>
      </View>
    );
  }

  // ─── Erro ─────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <View className="flex-1 bg-surface justify-center items-center p-8">
        <MaterialIcons name="error-outline" size={48} color="#ba1a1a" />
        <Text className="text-error mt-4 font-bold text-center">
          Não foi possível carregar as conquistas.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="mt-4 bg-primary px-6 py-3 rounded-full"
        >
          <Text className="text-on-primary font-label-lg">Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      {/* TopAppBar */}
      <View
        className="flex-row justify-between items-center px-5 bg-surface border-b border-outline-variant/30"
        style={{ height: 64, paddingTop: 4 }}
      >
        <View className="w-10 h-10 rounded-full bg-surface-variant items-center justify-center border border-outline-variant">
          <MaterialIcons name="person" size={22} color="#00236f" />
        </View>
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="military-tech" size={20} color="#00236f" />
          <Text className="text-primary font-bold" style={{ fontSize: 17 }}>
            BibleQuest
          </Text>
        </View>
        <View className="flex-row items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant">
          <Text style={{ fontSize: 14 }}>🔥</Text>
          <Text className="text-primary font-bold text-sm">7 Dias</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }}
      >
        {/* Cabeçalho da tela */}
        <View className="mb-5 flex-row items-end justify-between">
          <View>
            <Text
              className="text-primary font-bold tracking-tight"
              style={{ fontSize: 26, lineHeight: 32 }}
            >
              Galeria de{"\n"}Conquistas
            </Text>
            <Text className="text-on-surface-variant font-body-md mt-1">
              Colecione medalhas e demonstre{"\n"}seu conhecimento bíblico.
            </Text>
          </View>

          {/* Card de progresso geral */}
          <View
            className="bg-surface-container rounded-2xl p-3 items-center"
            style={{ minWidth: 90, shadowColor: "#00236f", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}
          >
            <MaterialIcons name="emoji-events" size={28} color="#fea619" />
            <Text className="text-primary font-bold mt-1" style={{ fontSize: 16 }}>
              {unlocked.length}/{achievements.length}
            </Text>
            <Text className="text-on-surface-variant" style={{ fontSize: 10 }}>
              completado
            </Text>
            {/* Barra de progresso geral */}
            <View className="w-full bg-surface-variant rounded-full overflow-hidden mt-2" style={{ height: 4 }}>
              <View
                className="h-full rounded-full bg-primary"
                style={{
                  width: achievements.length > 0
                    ? `${Math.round((unlocked.length / achievements.length) * 100)}%`
                    : "0%",
                }}
              />
            </View>
          </View>
        </View>

        {/* Seção: Desbloqueadas */}
        {unlocked.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="lock-open" size={18} color="#00311f" />
              <Text
                className="font-bold text-on-surface"
                style={{ fontSize: 15 }}
              >
                Desbloqueadas ({unlocked.length})
              </Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {unlocked.map((item) => (
                <View key={item.id} style={{ width: "47%" }}>
                  <AchievementCard item={item} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Seção: Em andamento / Bloqueadas */}
        {locked.length > 0 && (
          <View>
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="lock" size={18} color="#757682" />
              <Text
                className="font-bold text-on-surface-variant"
                style={{ fontSize: 15 }}
              >
                Bloqueadas ({locked.length})
              </Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {locked.map((item) => (
                <View key={item.id} style={{ width: "47%" }}>
                  <AchievementCard item={item} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Estado vazio */}
        {achievements.length === 0 && (
          <View className="items-center justify-center mt-20">
            <MaterialIcons name="military-tech" size={64} color="#c5c5d3" />
            <Text className="text-on-surface-variant text-center mt-4 font-body-md">
              Nenhuma conquista disponível ainda.{"\n"}Jogue mais para desbloquear!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
