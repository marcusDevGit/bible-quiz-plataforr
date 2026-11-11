import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { authMiddleware, requireAdmin } from "../middlewares/auth.middleware";

const categoryRouter = Router();
const categoryController = new CategoryController();

categoryRouter.get("/categories", authMiddleware, categoryController.list);
categoryRouter.post(
  "/categories",
  authMiddleware,
  requireAdmin,
  categoryController.create,
);
categoryRouter.put(
  "/categories/:id",
  authMiddleware,
  requireAdmin,
  categoryController.update,
);
categoryRouter.delete(
  "/categories/:id",
  authMiddleware,
  requireAdmin,
  categoryController.delete,
);

export { categoryRouter };
