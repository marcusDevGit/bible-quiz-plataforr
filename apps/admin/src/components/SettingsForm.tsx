import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiFetch } from "../service/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

interface MeResponse {
  user: AdminUser;
}

interface UpdateProfileResponse {
  message: string;
  user: AdminUser;
}

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";

export function SettingsForm() {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const { data: meData, isLoading } = useQuery<MeResponse>({
    queryKey: ["admin-me"],
    queryFn: () => apiFetch<MeResponse>("/users/me"),
    retry: 1,
  });

  useEffect(() => {
    if (meData?.user) {
      setName(meData.user.name || "");
      setEmail(meData.user.email || "");
      setAvatar(meData.user.avatar || "");
      localStorage.setItem("admin_user", JSON.stringify(meData.user));
      return;
    }

    const cached = localStorage.getItem("admin_user");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Partial<AdminUser>;
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.avatar) setAvatar(parsed.avatar);
      } catch {
        // Ignora cache inválido
      }
    }
  }, [meData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (name.trim().length < 3) {
      setMessage({
        type: "error",
        text: "O nome deve ter pelo menos 3 caracteres.",
      });
      return;
    }

    if (password) {
      if (password.length < 6) {
        setMessage({
          type: "error",
          text: "A nova senha deve ter pelo menos 6 caracteres.",
        });
        return;
      }
      if (password !== confirmPassword) {
        setMessage({ type: "error", text: "As senhas não coincidem." });
        return;
      }
    }

    try {
      setIsSaving(true);
      const payload: { name: string; avatar: string; password?: string } = {
        name: name.trim(),
        avatar: avatar.trim(),
      };
      if (password) {
        payload.password = password;
      }

      const response = await apiFetch<UpdateProfileResponse>("/users/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (response.user) {
        localStorage.setItem("admin_user", JSON.stringify(response.user));
      }

      await queryClient.invalidateQueries({ queryKey: ["admin-me"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });

      setMessage({
        type: "success",
        text: response.message || "Perfil atualizado com sucesso!",
      });
      toast.success("Perfil atualizado com sucesso!");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao atualizar as configurações do perfil.";
      setMessage({
        type: "error",
        text: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-surface border border-outline-variant rounded-xl shadow-sm max-w-2xl mx-auto overflow-hidden">
      <div className="p-6 border-b border-outline-variant bg-surface-bright">
        <h2 className="font-title-md text-title-md text-on-surface">
          Configurações do Perfil
        </h2>
        <p className="font-body-sm text-label-sm text-on-surface-variant mt-1">
          Gerencie suas credenciais de administrador e foto de exibição.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {message && (
          <div
            className={`p-4 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-tertiary-fixed-dim/20 text-tertiary-container border border-tertiary-fixed-dim/30" : "bg-error-container/20 text-error border border-error-container/30"}`}
          >
            {message.text}
          </div>
        )}

        <div className="flex items-center gap-6">
          <img
            src={avatar || DEFAULT_AVATAR}
            alt="Avatar Preview"
            className="w-20 h-20 rounded-full border border-outline-variant object-cover shadow-sm"
          />
          <div className="flex-1 space-y-1">
            <label className="block text-sm font-semibold text-on-surface">
              URL da Foto de Perfil
            </label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              disabled={isLoading || isSaving}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md focus:ring-2 focus:ring-primary focus:bg-surface focus:outline-none transition-all disabled:opacity-60"
              placeholder="Cole o link da nova imagem de perfil..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-on-surface">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading || isSaving}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md focus:ring-2 focus:ring-primary focus:bg-surface focus:outline-none transition-all disabled:opacity-60"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-on-surface">
              E-mail da Conta
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md text-on-surface-variant opacity-75 cursor-not-allowed"
              placeholder={isLoading ? "Carregando..." : "E-mail do administrador"}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-on-surface">
              Nova Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || isSaving}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md focus:ring-2 focus:ring-primary focus:bg-surface focus:outline-none transition-all disabled:opacity-60"
              placeholder="Digite se desejar alterar (mín. 6 caracteres)..."
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-on-surface">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading || isSaving}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md focus:ring-2 focus:ring-primary focus:bg-surface focus:outline-none transition-all disabled:opacity-60"
              placeholder="Confirme a nova senha..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
          <button
            type="submit"
            disabled={isLoading || isSaving}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-lg text-label-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
