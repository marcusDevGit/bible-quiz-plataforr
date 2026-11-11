import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminRanking } from "../service/admin.service";

type PeriodTab = "global" | "weekly" | "monthly";

export function Ranking() {
  const [period, setPeriod] = useState<PeriodTab>("global");

  const {
    data: ranking = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-ranking", period],
    queryFn: () => getAdminRanking(period),
  });

  const getBadgeStyle = (position: number) => {
    if (position === 1) {
      return "bg-secondary-container text-on-secondary-container font-bold";
    }
    if (position === 2) {
      return "bg-surface-container-high text-on-surface font-bold";
    }
    if (position === 3) {
      return "bg-primary-container/20 text-primary font-bold";
    }
    return "bg-surface-container-low text-on-surface-variant font-medium";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">
            Classificação & Rankings
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Visualize o Leaderboard oficial dos jogadores por período.
          </p>
        </div>

        <div className="inline-flex bg-surface-container-low p-1 rounded-xl border border-outline-variant">
          {(
            [
              { key: "global", label: "Global" },
              { key: "weekly", label: "Semanal (7d)" },
              { key: "monthly", label: "Mensal (30d)" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                period === tab.key
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <h2 className="font-title-md text-title-md text-on-surface">
            Top Jogadores ({ranking.length})
          </h2>
          <span className="material-symbols-outlined text-secondary-container">
            emoji_events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold w-24">Posição</th>
                <th className="py-4 px-6 font-semibold">Jogador</th>
                <th className="py-4 px-6 font-semibold text-center">
                  Nível Estimado
                </th>
                <th className="py-4 px-6 font-semibold text-right">
                  Pontuação (XP)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-on-surface-variant"
                  >
                    Carregando classificação...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-error">
                    Erro ao carregar ranking: {(error as Error)?.message}
                  </td>
                </tr>
              ) : ranking.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-on-surface-variant"
                  >
                    Nenhum jogador pontuou neste período ainda.
                  </td>
                </tr>
              ) : (
                ranking.map((player) => {
                  const level = Math.floor((player.points || 0) / 200) + 1;
                  return (
                    <tr
                      key={player.id}
                      className="hover:bg-surface-container-low transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs ${getBadgeStyle(player.position)}`}
                        >
                          {player.position}º
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm overflow-hidden">
                            {player.avatar ? (
                              <img
                                src={player.avatar}
                                alt={player.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              player.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="font-medium text-on-surface">
                            {player.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-container/10 text-primary">
                          Nível {level}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-primary">
                        {player.points.toLocaleString("pt-BR")} XP
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
