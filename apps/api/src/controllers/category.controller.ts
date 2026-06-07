import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";
import { categorySchema } from "@bible-quiz/shared-validation";

const categoryService = new CategoryService();

export class CategoryController {
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await categoryService.list();
      return res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = categorySchema.parse(req.body);
      const category = await categoryService.create(validatedData);
      return res.status(201).json({
        message: "Categoria criada com sucesso.",
        category,
      });
    } catch (error) {
      next(error);
    }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = categorySchema.parse(req.body);
      const category = await categoryService.update(id, validatedData);
      return res.status(200).json({
        message: "Categoria atualizada com sucesso.",
        category,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await categoryService.delete(id);
      return res.status(200).json({
        message: "Categoria deletada com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  };
}
