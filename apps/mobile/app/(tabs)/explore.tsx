import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { authService } from "~/src/features/auth/services/auth.service";
import { rankingService } from "~/src/features/ranking/services/ranking.service";
import { categoryService } from "~/src/features/categories/services/category.service";

import { STITCH_CATEGORIES, FILTER_PILLS } from "~/src/features/quiz/components/hub/types";
import { DailyChallengeCard } from "~/src/features/quiz/components/hub/DailyChallengeCard";
import { JourneySection } from "~/src/features/quiz/components/hub/JourneySection";
import { ThematicCategoriesSection } from "~/src/features/quiz/components/hub/ThematicCategoriesSection";
import { SpecialModesSection } from "~/src/features/quiz/components/hub/SpecialModesSection";

export default function ExploreQuizRoute() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Todos");

  const { data: profileData, refetch: refetchProfile, isRefetching: isRefetchingProfile } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: () => authService.getProfile(),
  });
  const loggedUser = profileData?.user;

  const { data: ranking = [], refetch: refetchRanking, isRefetching: isRefetchingRanking } = useQuery({
    queryKey: ["ranking"],
    queryFn: () => rankingService.getGlobalRanking(),
  });
  const loggedUserRank = ranking.find((p) => p.id === loggedUser?.id);

  const { data: apiCategories = [], refetch: refetchCategories, isRefetching: isRefetchingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
  });

  const userPoints = loggedUserRank?.points ?? 0;
  const currentLevel = Math.floor(userPoints / 200) + 1;
  const isRefreshing = isRefetchingProfile || isRefetchingRanking || isRefetchingCategories;

  const handleRefresh = () => {
    refetchProfile();
    refetchRanking();
    refetchCategories();
  };

  const mergedCategories = STITCH_CATEGORIES.map((stitchCat) => {
    const matchedApiCat = apiCategories.find(
      (apiCat) => apiCat.name.toLowerCase() === stitchCat.name.toLowerCase(),
    );
    return matchedApiCat
      ? {
          ...stitchCat,
          id: matchedApiCat.id,
          questionsCount: matchedApiCat._count?.questions ?? stitchCat.questionsCount,
        }
      : stitchCat;
  });

  const filteredCategories = mergedCategories.filter((cat) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "Todos" ||
      cat.section.toLowerCase() === selectedFilter.toLowerCase() ||
      cat.name.toLowerCase().includes(selectedFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fb" }}>
      {/* TopAppBar Fixo */}
      <View style={{ height: 60, borderBottomWidth: 1, borderBottomColor: "#e6e8ea", backgroundColor: "#ffffff" }} className="flex-row justify-between items-center px-5 w-full">
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/profile")} className="relative flex-row items-center">
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "#eceef0", overflow: "hidden", borderWidth: 1.5, borderColor: "#c5c5d3", alignItems: "center", justifyContent: "center" }}>
            {loggedUser?.avatar ? (
              <Image source={{ uri: loggedUser.avatar }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            ) : (
              <MaterialIcons name="person" size={22} color="#00236f" />
            )}
          </View>
          <View style={{ position: "absolute", bottom: -4, right: -8, backgroundColor: "#fea619", borderRadius: 999, borderWidth: 1.5, borderColor: "#ffffff", paddingHorizontal: 4, paddingVertical: 1 }}>
            <Text style={{ color: "#684000", fontSize: 9, fontWeight: "bold" }}>Lvl {currentLevel}</Text>
          </View>
        </TouchableOpacity>

        <View className="flex-row items-center gap-2">
          <FontAwesome5 name="bible" size={18} color="#00236f" />
          <Text style={{ color: "#00236f", fontSize: 18, fontWeight: "bold", letterSpacing: -0.3 }}>BibleQuest</Text>
        </View>

        <View style={{ backgroundColor: "#f2f4f6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, borderWidth: 1, borderColor: "#e6e8ea" }} className="flex-row items-center gap-1">
          <Text style={{ fontSize: 12 }}>🔥</Text>
          <Text style={{ color: "#00236f", fontSize: 12, fontWeight: "bold" }}>{loggedUser?.currentStreak || 1} Dias</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={["#00236f"]} />}>
        <View className="w-full max-w-xl mx-auto px-5">
          {/* Header & Busca */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text style={{ color: "#00236f" }} className="text-2xl font-bold tracking-tight">Quizzes Bíblicos</Text>
                <Text style={{ color: "#757682", fontSize: 13, marginTop: 2 }}>Aprofunde seu conhecimento nas Escrituras</Text>
              </View>
              <View style={{ backgroundColor: "#ffddb8", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 }} className="flex-row items-center gap-1 shadow-sm">
                <MaterialIcons name="stars" size={16} color="#855300" />
                <Text style={{ color: "#653e00", fontWeight: "bold", fontSize: 12 }}>{userPoints} XP</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2">
              <View style={{ backgroundColor: "#ffffff", borderColor: "#e6e8ea", borderWidth: 1 }} className="flex-1 flex-row items-center h-12 px-3.5 rounded-xl shadow-sm">
                <MaterialIcons name="search" size={22} color="#757682" />
                <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Buscar por livro, profeta, parábola ou tema..." placeholderTextColor="#757682" style={{ color: "#191c1e", fontSize: 13 }} className="flex-1 ml-2" />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <MaterialIcons name="close" size={18} color="#757682" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity activeOpacity={0.8} style={{ width: 48, height: 48, backgroundColor: "#ffffff", borderColor: "#e6e8ea", borderWidth: 1, borderRadius: 12, alignItems: "center", justifyContent: "center" }} className="shadow-sm">
                <MaterialIcons name="tune" size={22} color="#00236f" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filtros em Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 16 }}>
            {FILTER_PILLS.map((pill) => {
              const isActive = selectedFilter === pill;
              return (
                <TouchableOpacity key={pill} onPress={() => setSelectedFilter(pill)} activeOpacity={0.8} style={{ backgroundColor: isActive ? "#00236f" : "#ffffff", borderColor: isActive ? "#00236f" : "#e6e8ea", borderWidth: 1, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 }} className="flex-row items-center gap-1.5 shadow-sm">
                  <Text style={{ color: isActive ? "#ffffff" : "#444651", fontWeight: "600", fontSize: 12 }}>{pill}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Seções Componentizadas */}
          <DailyChallengeCard />
          <JourneySection />
          <ThematicCategoriesSection categories={filteredCategories} />
          <SpecialModesSection />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
