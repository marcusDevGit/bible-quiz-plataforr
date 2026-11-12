import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiFetch } from "../service/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: "USER" | "ADMIN";
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

const MAX_AVATAR_DIMENSION = 400;
const MAX_DATA_URL_BYTES = 300 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Não foi possível ler a imagem selecionada."));
      }
    };
    reader.onerror = () =>
      reject(new Error("Erro ao ler o arquivo de imagem."));
    reader.readAsDataURL(file);
  });
}

async function optimizeAvatarImage(file: File): Promise<string> {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type.toLowerCase())) {
    throw new Error("Formato inválido. Selecione uma imagem PNG, JPG, WEBP ou GIF.");
  }

  if (typeof document === "undefined") {
    return readFileAsDataUrl(file);
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      try {
        const scale = Math.min(
          1,
          MAX_AVATAR_DIMENSION / Math.max(img.width || 1, img.height || 1),
        );
        const width = Math.max(1, Math.round((img.width || MAX_AVATAR_DIMENSION) * scale));
        const height = Math.max(1, Math.round((img.height || MAX_AVATAR_DIMENSION) * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          const fallback = await readFileAsDataUrl(file);
          resolve(fallback);
          return;
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        if (dataUrl.length > MAX_DATA_URL_BYTES) {
          dataUrl = canvas.toDataURL("image/jpeg", 0.65);
        }

        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        try {
          const fallback = await readFileAsDataUrl(file);
          resolve(fallback);
        } catch {
          reject(err);
        }
      }
    };

    img.onerror = async () => {
      URL.revokeObjectURL(objectUrl);
      try {
        const fallback = await readFileAsDataUrl(file);
        resolve(fallback);
      } catch {
        reject(new Error("Não foi possível carregar a imagem selecionada."));
      }
    };

    img.src = objectUrl;
  });
}

function readCachedAdminUser(): Partial<AdminUser> {
  const cached = localStorage.getItem("admin_user");
  if (!cached) return {};
  try {
    return JSON.parse(cached) as Partial<AdminUser>;
  } catch {
    return {};
  }
}

export function SettingsForm() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cachedUser] = useState<Partial<AdminUser>>(readCachedAdminUser);
  const [draftName, setDraftName] = useState<string | null>(null);
  const [draftAvatar, setDraftAvatar] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
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

  const name = draftName ?? meData?.user?.name ?? cachedUser.name ?? "";
  const email = meData?.user?.email ?? cachedUser.email ?? "";
  const avatar = draftAvatar ?? meData?.user?.avatar ?? cachedUser.avatar ?? "";
  const isDeviceImage = avatar.trim().startsWith("data:image/");

  useEffect(() => {
    if (!meData?.user) return;
    localStorage.setItem("admin_user", JSON.stringify(meData.user));
    window.dispatchEvent(new Event("admin-user-updated"));
  }, [meData]);

  const handleOpenFilePicker = () => {
    if (isLoading || isSaving || isProcessingImage) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setMessage(null);
    try {
      setIsProcessingImage(true);
      const optimizedDataUrl = await optimizeAvatarImage(file);
      setDraftAvatar(optimizedDataUrl);
      toast.success("Imagem carregada! Clique em Salvar Alterações para aplicar.");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao processar a imagem selecionada.";
      setMessage({ type: "error", text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemoveAvatar = () => {
    setDraftAvatar("");
    setMessage(null);
  };

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
      const trimmedAvatar = avatar.trim();
      const payload: { name: string; avatar: string | null; password?: string } = {
        name: name.trim(),
        avatar: trimmedAvatar ? trimmedAvatar : null,
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
        window.dispatchEvent(new Event("admin-user-updated"));
      }

      await queryClient.invalidateQueries({ queryKey: ["admin-me"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });

      setDraftName(null);
      setDraftAvatar(null);
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <button
            type="button"
            onClick={handleOpenFilePicker}
            disabled={isLoading || isSaving || isProcessingImage}
            title="Clique para escolher uma foto do dispositivo"
            className="relative group w-24 h-24 rounded-full shrink-0 border-2 border-outline-variant overflow-hidden shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed self-start sm:self-center"
          >
            <img
              src={avatar || DEFAULT_AVATAR}
              alt="Avatar Preview"
              className="w-full h-full object-cover"
            />
            <span className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[24px]">
                photo_camera
              </span>
            </span>
            <span className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow border border-surface">
              <span className="material-symbols-outlined text-[15px]">
                photo_camera
              </span>
            </span>
          </button>

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleOpenFilePicker}
                disabled={isLoading || isSaving || isProcessingImage}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm font-medium hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">
                  upload
                </span>
                {isProcessingImage
                  ? "Processando..."
                  : "Escolher foto do dispositivo"}
              </button>

              {avatar.trim() !== "" && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isLoading || isSaving || isProcessingImage}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-error-container/40 text-error text-sm font-medium hover:bg-error-container/15 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                  Remover foto
                </button>
              )}
            </div>

            {isDeviceImage && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed border border-primary-fixed-dim text-xs font-semibold">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 shrink-0 text-primary"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                Imagem do dispositivo selecionada
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-on-surface">
                URL da Foto de Perfil
              </label>
              <input
                type="url"
                value={isDeviceImage ? "" : avatar}
                onChange={(e) => setDraftAvatar(e.target.value)}
                disabled={isLoading || isSaving || isProcessingImage}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md focus:ring-2 focus:ring-primary focus:bg-surface focus:outline-none transition-all disabled:opacity-60"
                placeholder={
                  isDeviceImage
                    ? "Ou cole um link externo (https://...) para substituir..."
                    : "Cole o link da nova imagem de perfil..."
                }
              />
            </div>
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
              onChange={(e) => setDraftName(e.target.value)}
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
