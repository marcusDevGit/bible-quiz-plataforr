import { Request, Response, NextFunction } from "express";
import { QuestionService } from "../services/question.service";
import { questionSchema } from "@bible-quiz/shared-validation";

const questionService = new QuestionService();

export class QuestionController {
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId, difficulty, search, page, limit } = req.query;
      const filters = {
        categoryId: categoryId as string,
        difficulty: difficulty as "EASY" | "MEDIUM" | "HARD",
        search: search as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      };

      const result = await questionService.list(filters);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const question = await questionService.getById(id);
      return res.status(200).json(question);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = questionSchema.parse(req.body);
      const question = await questionService.create(validatedData);
      return res.status(201).json({
        message: "Pergunta criada com sucesso",
        question,
      });
    } catch (error) {
      next(error);
    }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = questionSchema.parse(req.body);
      const question = await questionService.update(id, validatedData);
      return res.status(200).json({
        message: "Pergunta atualizada com sucesso.",
        question,
      });
    } catch (error) {
      next(error);
    }
  };
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await questionService.delete(id);
      return res.status(200).json({
        message: "Pergunta excluída com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  };
}
