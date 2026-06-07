import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const categoryRouter = Router();
const categoryController = new CategoryController();

categoryRouter.get("/categories", authMiddleware, categoryController.list);
categoryRouter.post("/categories", authMiddleware, categoryController.create);
categoryRouter.put(
  "/categories/:id",
  authMiddleware,
  categoryController.update,
);
categoryRouter.delete(
  "/categories/:id",
  authMiddleware,
  categoryController.delete,
);

export { categoryRouter };
