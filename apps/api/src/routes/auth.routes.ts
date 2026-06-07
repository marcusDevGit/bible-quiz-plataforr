import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const authRouter = Router();
const authController = new AuthController();

authRouter.post("/auth/register", authController.register);
authRouter.post("/auth/login", authController.login);
authRouter.put("/users/profile", authMiddleware, authController.updateProfile);

authRouter.get("/users/me", authMiddleware, authController.me);

export { authRouter };
