const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error(
    "A variável de ambiente JWT_SECRET é obrigatória em ambiente de produção.",
  );
}

export const JWT_SECRET =
  process.env.JWT_SECRET || "secret_Bible_DeveLop_amb";
