// apps/mobile/app/_layout.tsx
import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View, StyleSheet, Platform } from "react-native";
import "./global.css";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.container}>
        <Slot />
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    backgroundColor: "#f7f9fb", // Cor de fundo padrão da superfície
    ...Platform.select({
      web: {
        // Aplica uma sombra elegante apenas na renderização web para destacar o mockup
        boxShadow: "0 0 24px rgba(0, 35, 111, 0.08)",
      },
    }),
  },
});
