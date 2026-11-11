import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema } from "@bible-quiz/shared-validation";

import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { AppError } from "../error/app-error";
import { UserRepository } from "../repositories/user.repository";

const authService = new AuthService();
const userRepository = new UserRepository();

const updateProfileSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres").optional(),
  password: z
    .union([
      z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
      z.literal(""),
    ])
    .optional(),
  avatar: z.string().nullable().optional(),
});

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const user = await authService.register(validatedData);

      return res.status(201).json({
        message: "Usuário cadastrado com sucesso",
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;

      const user = await userRepository.findById(userId);

      if (!user) {
        throw new AppError("Usuário não encontrado", 404);
      }
      return res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const validatedData = updateProfileSchema.parse(req.body);
      const user = await authService.updateProfile(userId, {
        name: validatedData.name,
        password: validatedData.password,
        avatar: validatedData.avatar ?? undefined,
      });
      return res.status(200).json({
        message: "Perfil atualizado com sucesso",
        user,
      });
    } catch (error) {
      next(error);
    }
  };
}
