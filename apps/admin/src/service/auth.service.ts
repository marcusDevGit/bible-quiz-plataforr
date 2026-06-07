// apps/admin/src/service/auth.service.ts

import { apiFetch } from "./api";

// 1. O formato que a sua API espera receber (email e senha)
export interface LoginInput {
  email: string;
  password: string;
}

// 2. O formato que o AuthService do Backend nos devolve
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

// 3. A mutação que vai conversar com o Servidor
export async function login(data: LoginInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 4. A ação de sair do sistema (limpar os cofres)
export function logout(): void {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
}
