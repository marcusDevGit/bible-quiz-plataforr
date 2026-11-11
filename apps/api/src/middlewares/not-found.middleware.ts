import { Request, Response } from "express";

/**
 * Responde em JSON padronizado quando nenhuma rota corresponder à requisição.
 */
export function notFoundMiddleware(req: Request, res: Response) {
  return res.status(404).json({
    status: "error",
    message: "Rota não encontrada",
    ...(req.requestId ? { requestId: req.requestId } : {}),
  });
}

