import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../service/categories.service";
import toast from "react-hot-toast";
import { CategoryModal } from "./CategoryModal";

export function CategoryTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  useEffect(() => {
    if (isError && error) {
      toast.error(`Falha ao buscar categorias: ${error.message}`);
    }
  }, [isError, error]);

  return (
    <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col mt-8">
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
        <h2 className="font-title-md text-title-md text-on-surface">
          Gerenciamento de Categorias
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-lg text-label-lg flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
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
                      className="text-primary hover:text-primary-container p-1"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        edit
                      </span>
                    </button>
                    <button
                      className="text-error hover:text-on-error-container p-1"
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
