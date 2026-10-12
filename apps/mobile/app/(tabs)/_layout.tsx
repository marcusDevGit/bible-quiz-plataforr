import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e6e8ea",
          height: Platform.OS === "ios" ? 85 : 65,
          paddingBottom: Platform.OS === "ios" ? 25 : 10,
          paddingTop: 10,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: "#00236f", // Azul Primário
        tabBarInactiveTintColor: "#757682", // Cinza Contorno
        tabBarLabelStyle: {
          fontFamily: "Inter",
          fontWeight: "600",
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Jogar",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="extension" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="arena"
        options={{
          title: "Arena",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="sports-esports" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: "Ranks",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="emoji-events" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={28} color={color} />
          ),
        }}
      />
      {/* Rota oculta da tab bar — acessível via router.push('/achievements') */}
      <Tabs.Screen
        name="achievements"
        options={{
          href: null, // Remove da tab bar sem remover a rota
        }}
      />
    </Tabs>
  );
}
