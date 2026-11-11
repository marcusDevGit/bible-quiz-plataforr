import { useQuery } from "@tanstack/react-query";
import { getQuestions } from "../service/question.service";
import { getAdminStats } from "../service/admin.service";
import { StatCard } from "../components/StatCard";

export function Dashboard() {
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
    retry: 1,
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["questions-total"],
    queryFn: () => getQuestions(1, 1),
  });

  const totalQuestions =
    statsData?.totalQuestions ?? dashboardData?.meta?.total ?? "...";
  const matchesToday = statsData?.matchesToday ?? 0;
  const totalMatches = statsData?.totalMatches ?? 0;
  const totalUsers = statsData?.totalUsers ?? 0;
  const recentMatches = statsData?.recentMatches ?? [];

  return (
    <>
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface">
          Visão Geral
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Acompanhe as métricas principais da plataforma em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Perguntas"
          value={totalQuestions.toString()}
          icon="quiz"
          trend="Banco de questões ativo"
          variant="primary"
        />
        <StatCard
          title="Partidas Hoje"
          value={isLoadingStats ? "..." : matchesToday.toLocaleString("pt-BR")}
          icon="sports_esports"
          trend="Iniciadas desde 00:00"
          variant="secondary"
        />
        <StatCard
          title="Total de Partidas"
          value={isLoadingStats ? "..." : totalMatches.toLocaleString("pt-BR")}
          icon="emoji_events"
          trend="Histórico acumulado"
          variant="tertiary"
        />
        <StatCard
          title="Usuários Registrados"
          value={isLoadingStats ? "..." : totalUsers.toLocaleString("pt-BR")}
          icon="group"
          trend="Contas ativas na base"
          variant="primary"
        />
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <div>
            <h2 className="font-title-md text-title-md text-on-surface">
              Partidas Recentes
            </h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Últimas 10 partidas registradas na plataforma (Solo e Arena 1v1)
            </p>
          </div>
          <span className="material-symbols-outlined text-primary">
            history
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Jogador 1</th>
                <th className="py-4 px-6 font-semibold">Modo / Oponente</th>
                <th className="py-4 px-6 font-semibold text-center">
                  Pontuação
                </th>
                <th className="py-4 px-6 font-semibold text-right">
                  Data / Hora
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface">
              {isLoadingStats ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-on-surface-variant"
                  >
                    Carregando partidas recentes...
                  </td>
                </tr>
              ) : recentMatches.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-on-surface-variant"
                  >
                    Nenhuma partida registrada até o momento.
                  </td>
                </tr>
              ) : (
                recentMatches.map((match) => (
                  <tr
                    key={match.id}
                    className="hover:bg-surface-container-low transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-on-surface">
                      {match.user1?.name || "Jogador"}
                    </td>
                    <td className="py-4 px-6">
                      {match.user2 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-container/20 text-secondary border border-secondary-container/30">
                          vs {match.user2.name} (1v1)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-container/10 text-primary">
                          Quiz Individual
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-primary">
                      {match.score} pts
                    </td>
                    <td className="py-4 px-6 text-right text-sm text-on-surface-variant">
                      {new Date(match.createdAt).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
