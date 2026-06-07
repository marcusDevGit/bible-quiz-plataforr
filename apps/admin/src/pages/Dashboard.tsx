// apps/admin/src/pages/Dashboard.tsx
import { useQuery } from "@tanstack/react-query";
import { getQuestions } from "../service/question.service";
import { StatCard } from "../components/StatCard";

export function Dashboard() {
  const { data: dashboardData } = useQuery({
    queryKey: ["questions-total"],
    queryFn: () => getQuestions(1, 1),
  });

  return (
    <>
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface">
          Visão Geral
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Acompanhe as métricas principais da plataforma hoje.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Perguntas"
          value={dashboardData?.meta?.total?.toString() || "..."}
          icon="quiz"
          trend="Métrica em tempo real"
          variant="primary"
        />
        <StatCard
          title="Quizzes Realizados hoje"
          value="8,932"
          icon="quiz"
          trend="+12% vs ontem"
          variant="secondary"
        />
        <StatCard
          title="Receita (Pro)"
          value="R$ 4.250"
          icon="payments"
          variant="tertiary"
        />
        <StatCard
          title="Novos Registros"
          value="342"
          icon="person_add"
          trend="+2.1% esta semana"
          variant="primary"
        />
      </div>
    </>
  );
}
