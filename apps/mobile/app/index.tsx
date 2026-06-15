// apps/mobile/app/index.tsx
import { Redirect } from "expo-router";

export default function Index() {
  // Bateu na porta da rua? Jogue direto para o Dashboard!
  return <Redirect href="/(tabs)" />;
}
