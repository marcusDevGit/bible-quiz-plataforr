import "express-async-errors";
import express from "express";
import cors from "cors";

import { authRouter } from "./routes/auth.routes";
import { questionRouter } from "./routes/question.routes";
import { categoryRouter } from "./routes/category.routes";
import { rankingRouter } from "./routes/ranking.routes";
import { matchRouter } from "./routes/match.routes";
import achievementsRouter from "./routes/achievements.routes";
import { healthRouter } from "./routes/health.routes";
import { requestContextMiddleware } from "./middlewares/request-context.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { errorMiddleware } from "./middlewares/error-middleware";

export const app = express();

// Middlewares
app.use(cors());
app.use(requestContextMiddleware);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.get("/", (_req, res) => {
  res.json({ message: "Bible Quiz API is running" });
});

app.use(healthRouter);
app.use(authRouter);
app.use(questionRouter);
app.use(categoryRouter);
app.use(rankingRouter);
app.use(matchRouter);
app.use("/achievements", achievementsRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);