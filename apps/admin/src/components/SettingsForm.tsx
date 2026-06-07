import { useState } from "react";

export function SettingsForm() {
  const [name, setName] = useState("Admin User");
  const [avatar, setAvatar] = useState(
    "https://lh3.googleusercontent.com/aida-public/AB6AXuADvyGL6Cfgwp7AvIFgAR0G0RlowoDFnjHHxlYi1vS61apuzUc7hvBoWRiBfdU5vmL7Gbpdip5M3HFFuzpkI3zP4C98VZG9KjrwUSYPSHdpAIcHxQD2Y-v_jWoiFVg9M1rY_-8enFBf3CKXD0uw4GkO7kUFrjaSP-IfKN4KBeZEQc5DiFc4G8l0KDsDChGRlCKcLbJoC-9T3Qn6bd_Gqnat12kp8cBmvW2-LjcTaTsYvGM8qVLaWXTcGAejWPTCunAdhRpZAR-2oia7",
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setMessage({ type: "error", text: "As senhas não coincidem." });
      return;
    }
    // Simulação visual de sucesso (posteriormente conectada via fetch/axios à API)
    setMessage({
      type: "success",
      text: "Perfil atualizado com sucesso (Simulado)!",
    });
    setPassword("");
    setConfirmPassword("");
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
            src={
              avatar ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
            }
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
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md focus:ring-2 focus:ring-primary focus:bg-surface focus:outline-none transition-all"
              placeholder="Cole o link da nova imagem de perfil..."
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-on-surface">
            Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md focus:ring-2 focus:ring-primary focus:bg-surface focus:outline-none transition-all"
            required
          />
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
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md focus:ring-2 focus:ring-primary focus:bg-surface focus:outline-none transition-all"
              placeholder="Digite se desejar alterar..."
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
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md focus:ring-2 focus:ring-primary focus:bg-surface focus:outline-none transition-all"
              placeholder="Confirme a nova senha..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
          <button
            type="submit"
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-lg text-label-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer"
          >
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
