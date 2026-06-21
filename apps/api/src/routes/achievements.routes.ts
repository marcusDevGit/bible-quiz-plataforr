import { Router } from "express";
import { AchievementsController } from "../controllers/achievements.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const controller = new AchievementsController();

router.get("/", authMiddleware, controller.getAchievements.bind(controller));

export default router;
