// apps/admin/src/pages/Login.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login, type LoginInput } from "../service/auth.service";

export function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // O Sucesso! Guardamos os dados no cofre do navegador
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));

      toast.success(`Bem-vindo(a) de volta, ${data.user.name}!`);

      // Jogamos o usuário para dentro do painel
      navigate("/");
    },
    onError: (error: Error) => {
      toast.error(error.message || "E-mail ou senha incorretos.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Preencha todos os campos.");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    // Tela cheia, centralizada
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface border border-outline-variant rounded-2xl shadow-lg p-8">
        {/* Cabeçalho do Login */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">lock</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface">
            Acesso Restrito
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Insira suas credenciais de administrador.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              E-mail
            </label>
            <input
              type="email"
              placeholder="admin@biblequest.com"
              className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 px-4 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary-container hover:text-on-primary-container focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors disabled:opacity-50 mt-4"
          >
            {mutation.isPending ? "Autenticando..." : "Entrar no Sistema"}
          </button>
        </form>
      </div>
    </div>
  );
}
