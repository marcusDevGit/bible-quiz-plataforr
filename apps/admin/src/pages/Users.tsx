import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminUsers, type AdminUserItem } from "../service/admin.service";

export function Users() {
  const [search, setSearch] = useState("");

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
  });

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  const getUserPoints = (user: AdminUserItem) =>
    user.points ?? user.ranking?.points ?? 0;

  const getUserWins = (user: AdminUserItem) =>
    user.wins ?? user.ranking?.wins ?? 0;

  const getUserMatches = (user: AdminUserItem) =>
    user.matchesPlayed ??
    (user._count?.matchesAsPlayerOne ?? 0) +
      (user._count?.matchesAsPlayerTwo ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">
            Usuários Cadastrados
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Acompanhe o engajamento, ofensiva diária e pontuação dos jogadores.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface border border-outline-variant text-body-md focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <h2 className="font-title-md text-title-md text-on-surface">
            Lista de Jogadores ({filteredUsers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Usuário</th>
                <th className="py-4 px-6 font-semibold">E-mail</th>
                <th className="py-4 px-6 font-semibold text-center">
                  Ofensiva (Atual / Recorde)
                </th>
                <th className="py-4 px-6 font-semibold text-center">
                  XP / Vitórias
                </th>
                <th className="py-4 px-6 font-semibold text-center">
                  Partidas
                </th>
                <th className="py-4 px-6 font-semibold text-right">
                  Cadastro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-on-surface-variant"
                  >
                    Carregando usuários...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-error">
                    Erro ao carregar usuários: {(error as Error)?.message}
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-on-surface-variant"
                  >
                    Nenhum usuário encontrado para o filtro informado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-surface-container-low transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm overflow-hidden">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="font-medium text-on-surface">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant text-sm">
                      {user.email}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary-container/20 text-secondary border border-secondary-container/30">
                        🔥 {user.currentStreak ?? 0}d / máx{" "}
                        {user.bestStreak ?? 0}d
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-semibold text-primary">
                        {getUserPoints(user).toLocaleString("pt-BR")} XP
                      </span>
                      <span className="text-xs text-on-surface-variant ml-1.5">
                        ({getUserWins(user)} vit.)
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-on-surface">
                      {getUserMatches(user)}
                    </td>
                    <td className="py-4 px-6 text-right text-sm text-on-surface-variant">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
