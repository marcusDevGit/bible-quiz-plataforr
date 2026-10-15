import "express-async-errors"
import express from "express"
import cors from "cors"

import { authRouter } from "./routes/auth.routes"
import { questionRouter } from "./routes/question.routes"
import { categoryRouter } from "./routes/category.routes"
import { rankingRouter } from "./routes/ranking.routes"
import { matchRouter } from "./routes/match.routes"
import achievementsRouter from "./routes/achievements.routes"
import { errorMiddleware } from "./middlewares/error-middleware"
import { AppError } from "./error/app-error";


export const app = express();

//Middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({message: " Bible Quiz API is running"});
})

app.get("/test-async-error", async (req, res) => {
  await Promise.resolve();
  throw new AppError("Teste de erro assíncrono capturado com sucesso!", 418);
});

app.use(authRouter)
app.use(questionRouter);
app.use(categoryRouter);
app.use(rankingRouter);
app.use(matchRouter);
app.use("/achievements", achievementsRouter)

app.use(errorMiddleware)