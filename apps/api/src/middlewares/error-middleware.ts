import { Request, Response, NextFunction } from "express";
import { AppError } from "../error/app-error";
import { ZodError } from "zod";

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      status: "validation_error",
      errors: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
    });
  }

  console.error("Unhandled internal error:", error);

  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
}
