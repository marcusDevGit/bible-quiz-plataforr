import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.routes";
import { questionRouter } from "./routes/question.routes";
import { categoryRouter } from "./routes/category.routes";
import { rankingRouter } from "./routes/ranking.routes";
import { errorMiddleware } from "./middlewares/error-middleware";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Bible Quiz API is running!" });
});

app.use(authRouter);
app.use(questionRouter);
app.use(categoryRouter);
app.use(rankingRouter);
app.use(errorMiddleware);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
