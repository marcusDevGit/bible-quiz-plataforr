import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { authService } from "@/features/auth/services/auth.service";

export default function Index() {
  const router = useRouter();


  useEffect(() => {
    async function checkAuth() {
      const token = await authService.getToken();
      if (token) {
        router.replace("/(tabs)")
      } else {
        router.replace("/login")
      }
    }

    checkAuth();
  }, [router]);

  return (
    <View style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f7f9fb"
    }}>
      <ActivityIndicator size="large" color="#00236f" />
    </View>
  );
}
