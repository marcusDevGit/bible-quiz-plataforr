import { apiFetch, TOKEN_KEY } from "@/services/api";
import * as SecureStore from "expo-secure-store";
import { LoginInput } from "@bible-quiz/shared-validation";
import { Platform } from "react-native";

export const authService = {
  async Login(data: LoginInput): Promise<{ token: string; user: any }> {
    const response = await apiFetch<{ token: string; user: any }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    // Tratativa Híbrida: Web vs Celular
    if (Platform.OS === "web") {
      localStorage.setItem(TOKEN_KEY, response.token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, response.token);
    }

    return response;
  },

  async register(data: any): Promise<{ token: string; user: any }> {
    await apiFetch<{ message: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return this.Login({ email: data.email, password: data.password });
  },

  async logout(): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  },

  async getToken(): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },
  async getProfile(): Promise<{ user: any }> {
    return apiFetch<{ user: any }>("/users/me");
  },

  async updateProfile(data: {
    name?: string;
    avatar?: string | null;
    password?: string;
  }): Promise<{ message: string; user: any }> {
    return apiFetch<{ message: string; user: any }>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
