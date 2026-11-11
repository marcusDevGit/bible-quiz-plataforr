import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../error/app-error";
import { JWT_SECRET } from "../config/env";
import { prisma } from "../prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role?: string;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  userId: string;
  user?: {
    id: string;
    role?: string;
  };
}

interface JwtPayload {
  sub: string;
  role?: string;
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
    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };
    return next();
  } catch (error) {
    throw new AppError("Token de autenticação invalido", 401);
  }
}

export function createRequireAdmin(
  findUserRole: (userId: string) => Promise<{ role: string } | null> = (
    userId,
  ) =>
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    }),
) {
  return async function requireAdminMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const userId = req.user?.id || (req as AuthenticatedRequest).userId;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Usuário não autenticado",
      });
    }

    try {
      const user = await findUserRole(userId);

      if (!user || user.role !== "ADMIN") {
        return res.status(403).json({
          status: "error",
          message: "Acesso negado: permissão de administrador necessária",
        });
      }

      req.user = {
        id: userId,
        role: user.role,
      };

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export const requireAdmin = createRequireAdmin();
