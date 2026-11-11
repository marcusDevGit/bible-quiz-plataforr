import { Router } from "express";
import { QuestionController } from "../controllers/question.controller";
import { authMiddleware, requireAdmin } from "../middlewares/auth.middleware";

const questionRouter = Router();
const questionController = new QuestionController();

questionRouter.get("/questions", authMiddleware, questionController.list);
questionRouter.get(
  "/questions/:id",
  authMiddleware,
  questionController.getById,
);
questionRouter.post(
  "/questions/:id/check",
  authMiddleware,
  questionController.checkAnswer,
);
questionRouter.post(
  "/questions",
  authMiddleware,
  requireAdmin,
  questionController.create,
);
questionRouter.put(
  "/questions/:id",
  authMiddleware,
  requireAdmin,
  questionController.update,
);
questionRouter.delete(
  "/questions/:id",
  authMiddleware,
  requireAdmin,
  questionController.delete,
);

export { questionRouter };
