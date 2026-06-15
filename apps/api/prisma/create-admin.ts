import { AuthService } from "../src/services/auth.service";

async function createAdmin() {
  console.log("🔐 Criando usuário administrador...");
  const authService = new AuthService();

  try {
    const user = await authService.register({
      name: "Marcus (Admin)",
      email: "admin@biblequest.com",
      password: "password123", // Sua senha temporária
    });

    console.log(`✅ Sucesso! Administrador criado.`);
    console.log(`✉️  E-mail: ${user.email}`);
    console.log(`🔑 Senha: password123`);
  } catch (e: any) {
    if (e.message?.includes("já está sendo utilizado")) {
      console.log("⚠️ O usuário admin já existe no banco!");
    } else {
      console.error("❌ Erro:", e.message || e);
    }
  }
}

createAdmin();
