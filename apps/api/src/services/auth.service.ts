import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import { AppError } from "../error/app-error";
import { LoginInput, RegisterInput } from "@bible-quiz/shared-validation";
import { StreakService } from "./streak.service";

const userRepository = new UserRepository();
const streakService = new StreakService();
const JWT_SECRET = process.env.JWT_SECRET || "secret_Bible_DeveLop_amb";

export class AuthService {
  async register(data: RegisterInput) {
    const userExists = await userRepository.findByEmail(data.email);
    if (userExists) {
      throw new AppError("Este e-mail já está sendo utilizado.", 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userRepository.create({
      ...data,
      password: hashedPassword,
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async login(data: LoginInput) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError("Credenciais invalidas", 401);
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      throw new AppError("Credenciais invalidas", 401);
    }

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });

    const streak = await streakService.updateUserStreak(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        currentStreak: streak.currentStreak,
        bestStreak: streak.bestStreak,
      },
      token,
    };
  }

  async updateProfile(
    userId: string,
    data: { name?: string; password?: string; avatar?: string },
  ) {
    const updateData: { name?: string; password?: string; avatar?: string } =
      {};
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.avatar !== undefined) {
      updateData.avatar = data.avatar;
    }
    if (data.password !== undefined && data.password !== "") {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    return userRepository.update(userId, updateData);
  }
}
