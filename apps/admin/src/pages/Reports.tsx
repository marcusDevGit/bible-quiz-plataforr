import { useQuery } from "@tanstack/react-query";
import { getQuestions } from "../service/question.service";
import { getAdminStats } from "../service/admin.service";
import { StatCard } from "../components/StatCard";

const difficultyLabels = {
  EASY: "Fácil",
  MEDIUM: "Médio",
  HARD: "Difícil",
};

export function Reports() {
  const { data: questionsData, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["questions-report"],
    queryFn: () => getQuestions(1, 100),
  });

  const { data: statsData } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
    retry: 1,
  });

  const questions = questionsData?.data || [];
  const totalTimesPlayed = questions.reduce(
    (acc, q) => acc + (q.timesPlayed || 0),
    0,
  );
  const playedQuestions = questions.filter((q) => (q.timesPlayed || 0) > 0);
  const avgCorrectRate =
    playedQuestions.length > 0
      ? Math.round(
          playedQuestions.reduce((acc, q) => acc + (q.correctRate || 0), 0) /
            playedQuestions.length,
        )
      : 0;

  const sortedQuestions = [...questions].sort(
    (a, b) => (b.timesPlayed || 0) - (a.timesPlayed || 0),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface">
          Relatórios Pedagógicos & Desempenho
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Análise de dificuldade, taxa de acerto e frequência das perguntas nas
          partidas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Respostas Registradas"
          value={totalTimesPlayed.toLocaleString("pt-BR")}
          icon="analytics"
          trend="Acumulado nas questões"
          variant="primary"
        />
        <StatCard
          title="Taxa Média de Acerto"
          value={`${avgCorrectRate}%`}
          icon="check_circle"
          trend={`${playedQuestions.length} questões já respondidas`}
          variant="tertiary"
        />
        <StatCard
          title="Partidas Totais"
          value={(statsData?.totalMatches ?? 0).toLocaleString("pt-BR")}
          icon="sports_esports"
          trend={`${statsData?.matchesToday ?? 0} realizadas hoje`}
          variant="secondary"
        />
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <div>
            <h2 className="font-title-md text-title-md text-on-surface">
              Desempenho por Pergunta
            </h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Ordenado pelas perguntas mais sorteadas nas partidas
            </p>
          </div>
          <span className="material-symbols-outlined text-primary">
            bar_chart
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Pergunta</th>
                <th className="py-4 px-6 font-semibold">Categoria</th>
                <th className="py-4 px-6 font-semibold text-center">
                  Dificuldade
                </th>
                <th className="py-4 px-6 font-semibold text-center">
                  Vezes Jogada
                </th>
                <th className="py-4 px-6 font-semibold text-right">
                  Taxa de Acerto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface">
              {isLoadingQuestions ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-on-surface-variant"
                  >
                    Carregando estatísticas das perguntas...
                  </td>
                </tr>
              ) : sortedQuestions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-on-surface-variant"
                  >
                    Nenhuma pergunta encontrada.
                  </td>
                </tr>
              ) : (
                sortedQuestions.map((q) => {
                  const rate = Math.round(q.correctRate || 0);
                  return (
                    <tr
                      key={q.id}
                      className="hover:bg-surface-container-low transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium text-on-surface line-clamp-1">
                          {q.title}
                        </div>
                        <div className="text-xs text-on-surface-variant mt-0.5">
                          Ref: {q.reference}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-container/10 text-primary">
                          {q.category?.name || "Sem categoria"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-sm text-on-surface-variant">
                        {difficultyLabels[q.difficulty] || q.difficulty}
                      </td>
                      <td className="py-4 px-6 text-center font-semibold text-on-surface">
                        {q.timesPlayed || 0}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-20 h-2 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                              className="h-full bg-primary rounded-full"
                            />
                          </div>
                          <span className="text-sm font-semibold text-on-surface w-10 text-right">
                            {rate}%
                          </span>
                        </div>
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
