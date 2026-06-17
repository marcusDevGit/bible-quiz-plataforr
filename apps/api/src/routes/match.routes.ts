import { Router } from "express";
import { MatchController } from "../controllers/match.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const matchRouter = Router();
const matchController = new MatchController();

matchRouter.post("/match", authMiddleware, matchController.submitMatch);

export { matchRouter };
