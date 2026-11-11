import { apiFetch } from "./api";

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    questions: number;
  };
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories");
}

export async function createCategory(data: {
  name: string;
}): Promise<Category> {
  return apiFetch<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCategory(
  id: string,
  data: { name: string },
): Promise<Category> {
  const response = await apiFetch<{ message: string; category: Category }>(
    `/categories/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
  return response.category;
}

export async function deleteCategory(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/categories/${id}`, {
    method: "DELETE",
  });
}
