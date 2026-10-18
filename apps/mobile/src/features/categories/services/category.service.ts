import { apiFetch } from "~/src/services/api";

export interface CategoryItem {
    id: string;
    name: string;
    createdAt: string;
    _count:{
        questions:number;
    }
}

export const categoryService = {
    async getCategories(): Promise<CategoryItem[]> {
        return apiFetch<CategoryItem[]>('/categories');
    }
}