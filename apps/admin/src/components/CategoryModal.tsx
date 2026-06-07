import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "../service/categories.service";
import toast from "react-hot-toast";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryModal({ isOpen, onClose }: CategoryModalProps) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Categoria criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setName("");
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("O nome é obrigatório!");

    mutation.mutate({ name });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-xl shadow-lg border border-outline-variant p-6">
        <h2 className="text-title-lg font-title-lg text-on-surface mb-4">
          Nova Categoria
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="block text-label-md font-label-md text-on-surface-variant mb-1">
            <label className="block text-label-md font-label-md text-on-surface-variant md-1">
              Nome da Categoria
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-on-surface"
              placeholder="Ex: Profetas Menores"
              disabled={mutation.isPending}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
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
              className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors font-label-lg"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
