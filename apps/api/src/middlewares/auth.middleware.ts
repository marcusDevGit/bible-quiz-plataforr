import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../error/app-error";

const JWT_SECRET = process.env.JWT_SECRET || "secret_Bible_DeveLop_amb";

export interface AuthenticatedRequest extends Request {
  userId: string;
}
interface JwtPayload {
  sub: string;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("Token de autenticação não encontrado", 401);
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    throw new AppError("Formato de token invalido", 401);
  }

  const [schema, token] = parts;

  if (!/^Bearer$/i.test(schema)) {
    throw new AppError("Token de autenticação mal formatado", 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as AuthenticatedRequest).userId = decoded.sub;
    return next();
  } catch (error) {
    throw new AppError("Token de autenticação invalido", 401);
  }
}
