import { Router } from "express";
import { QuestionController } from "../controllers/question.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const questionRouter = Router();
const questionController = new QuestionController();

questionRouter.get("/questions", authMiddleware, questionController.list);
questionRouter.get(
  "/questions/:id",
  authMiddleware,
  questionController.getById,
);
questionRouter.post("/questions", authMiddleware, questionController.create);
questionRouter.put("/questions/:id", authMiddleware, questionController.update);
questionRouter.delete(
  "/questions/:id",
  authMiddleware,
  questionController.delete,
);

export { questionRouter };
