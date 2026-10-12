import { Router } from "express";
import { RankingController } from "../controllers/ranking.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const rankingRouter = Router();
const rankingController = new RankingController();

rankingRouter.get(
  "/ranking/global",
  authMiddleware,
  rankingController.getGlobalRanking,
);

rankingRouter.get(
  "/ranking/weekly",
  authMiddleware,
  rankingController.getWeeklyRanking,
);

rankingRouter.get(
  "/ranking/monthly",
  authMiddleware,
  rankingController.getMonthlyRanking,
);

export { rankingRouter };
