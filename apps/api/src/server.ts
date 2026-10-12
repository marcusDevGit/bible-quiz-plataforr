import { createServer } from "http";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.routes";
import { questionRouter } from "./routes/question.routes";
import { categoryRouter } from "./routes/category.routes";
import { rankingRouter } from "./routes/ranking.routes";
import { matchRouter } from "./routes/match.routes";
import achievementsRouter from "./routes/achievements.routes";
import { errorMiddleware } from "./middlewares/error-middleware";
import { initSocket } from "./socket";

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
initSocket(server);

app.get("/", (req, res) => {
  res.json({ message: "Bible Quiz API is running!" });
});

app.use(authRouter);
app.use(questionRouter);
app.use(categoryRouter);
app.use(rankingRouter);
app.use(matchRouter);
app.use("/achievements", achievementsRouter);
app.use(errorMiddleware);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
