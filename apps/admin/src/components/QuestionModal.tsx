import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createQuestion,
  updateQuestion,
  type Difficulty,
  type QuestionInput,
  type AlternativeInput,
  type Question,
} from "../service/question.service";
import { getCategories } from "../service/categories.service";
import toast from "react-hot-toast";

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionToEdit?: Question | null;
}

const DEFAULT_ALTERNATIVES: AlternativeInput[] = [
  { description: "", isCorrect: true },
  { description: "", isCorrect: false },
  { description: "", isCorrect: false },
  { description: "", isCorrect: false },
];

export function QuestionModal({
  isOpen,
  onClose,
  questionToEdit,
}: QuestionModalProps) {
  if (!isOpen) return null;

  return (
    <QuestionModalContent
      key={questionToEdit?.id ?? "new"}
      onClose={onClose}
      questionToEdit={questionToEdit}
    />
  );
}

function QuestionModalContent({
  onClose,
  questionToEdit,
}: Omit<QuestionModalProps, "isOpen">) {
  const queryClient = useQueryClient();
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const [title, setTitle] = useState(questionToEdit?.title || "");
  const [categoryId, setCategoryId] = useState(questionToEdit?.categoryId || "");
  const [difficulty, setDifficulty] = useState<Difficulty>(
    questionToEdit?.difficulty || "EASY",
  );
  const [reference, setReference] = useState(questionToEdit?.reference || "");
  const [explanation, setExplanation] = useState(
    questionToEdit?.explanation || "",
  );
  const [xpReward, setXpReward] = useState(questionToEdit?.xpReward ?? 10);
  const [difficultyScore, setDifficultyScore] = useState(
    questionToEdit?.difficultyScore ?? 1,
  );
  const [tags, setTags] = useState(
    Array.isArray(questionToEdit?.tags) ? questionToEdit.tags.join(", ") : "",
  );

  const [alternatives, setAlternatives] = useState<AlternativeInput[]>(() =>
    Array.isArray(questionToEdit?.alternatives) &&
    questionToEdit.alternatives.length > 0
      ? questionToEdit.alternatives.map((alt) => ({
          description: alt.description,
          isCorrect: alt.isCorrect,
        }))
      : DEFAULT_ALTERNATIVES.map((a) => ({ ...a })),
  );

  const mutation = useMutation({
    mutationFn: (payload: QuestionInput) => {
      if (questionToEdit) {
        return updateQuestion(questionToEdit.id, payload);
      }
      return createQuestion(payload);
    },
    onSuccess: () => {
      toast.success(
        questionToEdit
          ? "Pergunta atualizada com sucesso!"
          : "Pergunta criada com sucesso!",
      );
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["questions-total"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onClose();
    },
    onError: (error: Error) => {
      toast.error(
        `Erro ao ${questionToEdit ? "atualizar" : "criar"} pergunta: ${error.message}`,
      );
    },
  });

  const handleAlternativeChange = (index: number, value: string) => {
    const newAlts = [...alternatives];
    newAlts[index].description = value;
    setAlternatives(newAlts);
  };

  const handleCorrectChange = (index: number) => {
    const newAlts = alternatives.map((alt, i) => ({
      ...alt,
      isCorrect: i === index,
    }));
    setAlternatives(newAlts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId || !reference) {
      return toast.error("Preencha título, categoria e referência bíblica!");
    }

    const altFilled = alternatives.every(
      (alt) => alt.description.trim().length > 0,
    );
    if (!altFilled) return toast.error("Preencha todas as 4 alternativas");
    const payload: QuestionInput = {
      title,
      difficulty,
      categoryId,
      reference,
      explanation,
      xpReward: Number(xpReward),
      difficultyScore: Number(difficultyScore),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
      alternatives,
    };
    mutation.mutate(payload);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-4xl rounded-xl shadow-lg border border-outline-variant flex flex-col max-h-[90vh]">
        {/* Cabeçalho Fixo */}
        <div className="p-6 border-b border-outline-variant">
          <h2 className="text-title-lg font-title-lg text-on-surface">
            {questionToEdit ? "Editar Pergunta" : "Nova Pergunta"}
          </h2>
        </div>

        {/* Corpo com Rolagem (Scroll) */}
        <div className="p-6 overflow-y-auto flex-1">
          <form
            id="question-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-label-md text-on-surface-variant mb-1">
                  Título da Pergunta
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Quem construiu a arca?"
                />
              </div>
              {/* Categoria */}
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">
                  Categoria
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Selecione uma Categoria...</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Dificuldade */}
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">
                  Dificuldade
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="EASY">Fácil</option>
                  <option value="MEDIUM">Médio</option>
                  <option value="HARD">Difícil</option>
                </select>
              </div>
              {/* Referência e Tags */}
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">
                  Referência Bíblica
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Gênesis 6:14"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: dilúvio, noé, arca"
                />
              </div>
              {/* XP e Pontuação */}
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">
                  Recompensa (XP)
                </label>
                <input
                  type="number"
                  value={xpReward}
                  onChange={(e) => setXpReward(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">
                  Multiplicador de Dificuldade
                </label>
                <input
                  type="number"
                  value={difficultyScore}
                  onChange={(e) => setDifficultyScore(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  step="0.1"
                />
              </div>
            </div>
            {/* Explicação */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1">
                Explicação (Opcional)
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none min-h-[80px]"
                placeholder="Por que essa resposta está certa?"
              />
            </div>
            {/* Separador Visual */}
            <hr className="border-outline-variant" />
            {/* Módulo de Alternativas */}
            <div>
              <h3 className="text-title-sm font-title-sm text-on-surface mb-4">
                Alternativas (Marque a Correta)
              </h3>
              <div className="space-y-3">
                {alternatives.map((alt, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correctAlternative"
                      checked={alt.isCorrect}
                      onChange={() => handleCorrectChange(index)}
                      className="w-5 h-5 text-primary focus:ring-primary"
                    />
                    <input
                      type="text"
                      value={alt.description}
                      onChange={(e) =>
                        handleAlternativeChange(index, e.target.value)
                      }
                      className={`flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary outline-none ${
                        alt.isCorrect
                          ? "bg-primary-container/20 border-primary text-on-surface"
                          : "bg-surface border-outline-variant text-on-surface-variant"
                      }`}
                      placeholder={`Alternativa ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
        {/* Rodapé Fixo */}
        <div className="p-6 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-primary hover:bg-primary-container/30 transition-colors font-label-lg"
            disabled={mutation.isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="question-form"
            className="px-6 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors font-label-lg shadow-sm"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? "Salvando..."
              : questionToEdit
                ? "Atualizar Pergunta"
                : "Salvar Pergunta"}
          </button>
        </div>
      </div>
    </div>
  );
}
