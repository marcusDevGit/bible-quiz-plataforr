import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware, requireAdmin } from "../middlewares/auth.middleware";

const authRouter = Router();
const authController = new AuthController();

authRouter.post("/auth/register", authController.register);
authRouter.post("/auth/login", authController.login);
authRouter.put("/users/profile", authMiddleware, authController.updateProfile);

authRouter.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  console.log(`📩 [Recuperação de Senha] Solicitada para: ${email}`);
  
  return res.status(200).json({
    message: "Se o e-mail estiver cadastrado, as instruções foram enviadas.",
  });
});


authRouter.get("/users/me", authMiddleware, authController.me);
authRouter.get(
  "/users/admin-stats",
  authMiddleware,
  requireAdmin,
  authController.getAdminStats,
);
authRouter.get("/users", authMiddleware, requireAdmin, authController.listUsers);

export { authRouter };
