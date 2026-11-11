import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getQuestions,
  deleteQuestion,
  type Question,
} from "../service/question.service";
import toast from "react-hot-toast";
import { QuestionModal } from "./QuestionModal";

const difficultyBadges = {
  EASY: {
    label: "Facil",
    className:
      "bg-tertiary-fixed-dim/20 text-tertiary-container border border-tertiary-fixed-dim/30",
  },
  MEDIUM: {
    label: "Medio",
    className:
      "bg-secondary-container/20 text-secondary border border-secondary-container/30",
  },
  HARD: {
    label: "Difícil",
    className:
      "bg-error-container/50 text-on-error-container border border-error-container",
  },
};

export function QuestionTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["questions", page],
    queryFn: () => getQuestions(page, 10),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      toast.success("Pergunta excluída com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["questions-total"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: Error) => {
      toast.error(`Erro ao excluir pergunta: ${err.message}`);
    },
  });

  const handleCreateClick = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (question: Question) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (question: Question) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir a pergunta "${question.title}"?`,
      )
    ) {
      deleteMutation.mutate(question.id);
    }
  };

  useEffect(() => {
    if (isError && error) {
      toast.error(`Falha ao busca perguntas: ${error.message}`);
    }
  }, [isError, error]);

  const questionsList = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
      <QuestionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(null);
        }}
        questionToEdit={editingQuestion}
      />
      <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
        <h2 className="font-title-md text-title-md text-on-surface">
          Gerenciamento de Perguntas
        </h2>
        <button
          onClick={handleCreateClick}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-lg text-label-lg flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nova Pergunta
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-lowest border-b border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              <th className="py-4 px-6 font-semibold">Pergunta</th>
              <th className="py-4 px-6 font-semibold">Categoria</th>
              <th className="py-4 px-6 font-semibold">Dificuldade</th>
              <th className="py-4 px-6 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant bg-surface">
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-on-surface-variant"
                >
                  Carregando perguntas do servidor...
                </td>
              </tr>
            ) : questionsList.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-on-surface-variant"
                >
                  Nenhuma pergunta cadastrada no banco de dados.
                </td>
              </tr>
            ) : (
              questionsList.map((question) => {
                const badge = difficultyBadges[question.difficulty];

                return (
                  <tr
                    key={question.id}
                    className="hover:bg-surface-container-low transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="font-body-md text-body-md text-on-surface line-clamp-1">
                        {question.title}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-container/10 text-primary-container">
                        {/* Como mapeamos lá no serviço, o Prisma já mandou o objeto da categoria junto! */}
                        {question.category?.name || "Sem categoria"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge?.className}`}
                      >
                        {badge?.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(question)}
                        className="text-primary hover:text-primary-container transition-colors p-1 cursor-pointer"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          edit
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(question)}
                        disabled={deleteMutation.isPending}
                        className="text-error hover:text-on-error-container transition-colors p-1 cursor-pointer disabled:opacity-50"
                        title="Deletar"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          delete
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
        <span className="text-sm text-on-surface-variant font-medium">
          {meta
            ? `Mostrando ${questionsList.length} de ${meta.total} perguntas (Página ${meta.page} de ${meta.totalPages})`
            : "Carregando métricas..."}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
            disabled={!meta || meta.page <= 1}
          >
            Anterior
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
            disabled={!meta || meta.page >= meta.totalPages}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
