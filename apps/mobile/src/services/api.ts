import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.18.218:3001"
// "https://spotty-seals-think.loca.lt";
export const TOKEN_KEY = "mobile_jwt_token";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  console.log(`🌐 [API Request] ${options.method || "GET"} -> ${url}`);

  // Tratativa Multi-Plataforma para o Token!
  let token = null;
  if (Platform.OS === "web") {
    token = localStorage.getItem(TOKEN_KEY);
  } else {
    token = await SecureStore.getItemAsync(TOKEN_KEY);
  }

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.message ||
      (errorData.errors && errorData.errors[0]?.message) ||
      "Erro na requisição à API";
    throw new Error(errorMessage);
  }
  return response.json();
}
