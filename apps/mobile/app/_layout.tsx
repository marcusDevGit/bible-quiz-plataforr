import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View, StyleSheet, Platform, LogBox } from "react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

LogBox.ignoreLogs([
  "ImageBackground is deprecated",
  "[Reanimated] Dependencies should only be used on the web",
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <View style={styles.container}>
          <Slot />
        </View>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#f7f9fb",
    ...Platform.select({
      web: {
        maxWidth: 480,
        alignSelf: "center",
        boxShadow: "0 0 24px rgba(0, 35, 111, 0.08)",
      },
    }),
  },
});
