import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  deleteCategory,
  type Category,
} from "../service/categories.service";
import toast from "react-hot-toast";
import { CategoryModal } from "./CategoryModal";

export function CategoryTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Categoria excluída com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: Error) => {
      toast.error(`Erro ao excluir categoria: ${err.message}`);
    },
  });

  const handleCreateClick = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir a categoria "${category.name}"?`,
      )
    ) {
      deleteMutation.mutate(category.id);
    }
  };

  useEffect(() => {
    if (isError && error) {
      toast.error(`Falha ao buscar categorias: ${error.message}`);
    }
  }, [isError, error]);

  return (
    <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col mt-8">
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        categoryToEdit={editingCategory}
      />

      <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
        <h2 className="font-title-md text-title-md text-on-surface">
          Gerenciamento de Categorias
        </h2>
        <button
          onClick={handleCreateClick}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-lg text-label-lg flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nova Categoria
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-lowest border-b border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              <th className="py-4 px-6 font-semibold">Nome</th>
              <th className="py-4 px-6 font-semibold text-center">
                Nº Perguntas
              </th>
              <th className="py-4 px-6 font-semibold">Criado em</th>
              <th className="py-4 px-6 font-semibold text-right">Ações</th>
            </tr>
          </thead>

          {/* Se estiver carregando, exibimos uma mensagem simples */}
          <tbody className="divide-y divide-outline-variant bg-surface">
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-on-surface-variant"
                >
                  Carregando categorias do servidor...
                </td>
              </tr>
            ) : (
              data?.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-surface-container-low transition-colors group"
                >
                  <td className="py-4 px-6 font-body-md text-body-md text-on-surface">
                    {category.name}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-container/20 text-secondary border border-secondary-container/30">
                      {category._count?.questions || 0}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant text-sm">
                    {new Date(category.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditClick(category)}
                      className="text-primary hover:text-primary-container p-1 cursor-pointer"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        edit
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(category)}
                      disabled={deleteMutation.isPending}
                      className="text-error hover:text-on-error-container p-1 cursor-pointer disabled:opacity-50"
                      title="Deletar"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        delete
                      </span>
                    </button>
                  </td>
                </tr>
              ))
            )}

            {/* Se estiver vazio e não carregando */}
            {!isLoading && data?.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-on-surface-variant"
                >
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
