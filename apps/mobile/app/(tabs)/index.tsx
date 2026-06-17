import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const TOPBAR_HEIGHT = 64;
const TABBAR_HEIGHT = 65;

export default function DashboardScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();

  const scrollAreaHeight = height - TOPBAR_HEIGHT - TABBAR_HEIGHT;

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f9fb" }}>
      {/* TopAppBar — FIXO, fora do ScrollView */}
      <View
        style={{ height: TOPBAR_HEIGHT }}
        className="flex-row justify-between items-center px-5 w-full bg-surface border-b border-outline-variant/30"
      >
        {/* Leading: Avatar & Level */}
        <View className="relative flex-row items-center">
          <View className="w-10 h-10 rounded-full border-2 border-surface bg-surface-variant items-center justify-center">
            <MaterialIcons name="person" size={24} color="#00236f" />
          </View>
          <View
            style={{
              position: "absolute",
              bottom: -4,
              right: -8,
              backgroundColor: "#fea619",
              borderRadius: 999,
              borderWidth: 2,
              borderColor: "#f7f9fb",
              paddingHorizontal: 5,
              paddingVertical: 1,
              zIndex: 10,
            }}
          >
            <Text
              style={{
                color: "#684000",
                fontSize: 9,
                fontWeight: "bold",
                lineHeight: 13,
              }}
              numberOfLines={1}
            >
              Lvl 12
            </Text>
          </View>
        </View>

        {/* Headline/Brand */}
        <View className="flex-row items-center gap-2">
          <FontAwesome5 name="bible" size={18} color="#00236f" />
          <Text className="text-primary font-bold text-lg tracking-tight">
            BibleQuest
          </Text>
        </View>

        {/* Trailing: Streak Action */}
        <TouchableOpacity className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant">
          <Text className="text-sm">🔥</Text>
          <Text className="text-primary font-bold text-sm">7 Dias</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Canvas — ScrollView com altura calculada */}
      <ScrollView
        style={{ height: scrollAreaHeight }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}
      >
        <View className="px-5">
          {/* Hero Section */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-on-surface mb-2">
              Olá, João! 👋
            </Text>
            <Text className="text-base text-on-surface-variant mb-4">
              Pronto para o desafio de hoje?
            </Text>

            {/* Hero CTA Card */}
            <View className="bg-primary rounded-3xl p-6 relative overflow-hidden shadow-md">
              {/* Decorative Background Element */}
              <View className="absolute -right-4 -top-4 opacity-20">
                <MaterialIcons name="menu-book" size={120} color="#ffffff" />
              </View>

              <View className="relative z-10">
                <View className="self-start px-3 py-1 bg-primary-container rounded-full mb-4">
                  <Text className="text-on-primary-container text-xs font-bold uppercase tracking-wider">
                    Continuar Lendo
                  </Text>
                </View>

                <Text className="text-white text-2xl font-bold mb-2">
                  Evangelho de João
                </Text>

                {/* Progress Bar */}
                <View className="mt-4 mb-6">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-white text-xs opacity-90">
                      Progresso
                    </Text>
                    <Text className="text-white text-xs opacity-90">65%</Text>
                  </View>
                  <View className="w-full h-2 bg-primary-fixed-dim/30 rounded-full overflow-hidden">
                    <View className="h-full bg-secondary-container rounded-full w-[65%]" />
                  </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  onPress={() => router.push("/quiz")}
                  className="bg-secondary-container py-3 px-6 rounded-xl flex-row items-center justify-center gap-2"
                >
                  <Text className="text-on-secondary-container font-bold text-sm">
                    Retomar Quiz
                  </Text>
                  <MaterialIcons name="play-arrow" size={20} color="#684000" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Quick Actions Bento Grid */}
          <View className="flex-row justify-between gap-4">
            {/* Action 1 */}
            <TouchableOpacity
              onPress={() => router.push("/quiz")}
              className="flex-1 bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30 items-center justify-center"
            >
              <View className="w-12 h-12 rounded-full bg-primary-container/10 items-center justify-center mb-2">
                <MaterialIcons
                  name="calendar-today"
                  size={24}
                  color="#00236f"
                />
              </View>
              <Text className="text-on-surface font-bold text-base text-center">
                Quiz Diário
              </Text>
              <Text className="text-on-surface-variant text-sm mt-1">
                +50 XP
              </Text>
            </TouchableOpacity>

            {/* Action 2 */}
            <TouchableOpacity
              onPress={() => router.push("/arena")}
              className="flex-1 bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30 items-center justify-center relative"
            >
              {/* Notificação Red Dot */}
              <View className="absolute top-3 right-3 w-2 h-2 rounded-full bg-error" />

              <View className="w-12 h-12 rounded-full bg-secondary-container/20 items-center justify-center mb-2">
                <MaterialIcons
                  name="sports-esports"
                  size={24}
                  color="#fea619"
                />
              </View>
              <Text className="text-on-surface font-bold text-base text-center">
                Desafio Multiplayer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
