export type LogLevel = "info" | "warn" | "error";

export interface LogMetadata {
  requestId?: string;
  [key: string]: unknown;
}

const REDACTED_KEYS = new Set([
  "password",
  "token",
  "authorization",
  "cookie",
  "secret",
  "jwt_secret",
  "database_url",
]);

function sanitizeValue(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      ...(process.env.NODE_ENV !== "production" && value.stack
        ? { stack: value.stack }
        : {}),
    };
  }

  if (depth > 3 || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = sanitizeValue(entry, depth + 1);
    }
  }
  return sanitized;
}

function writeLog(level: LogLevel, event: string, metadata?: LogMetadata): void {
  if (process.env.LOG_SILENT === "true") return;

  const safeMetadata = metadata
    ? (sanitizeValue(metadata) as Record<string, unknown>)
    : {};

  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service: "bible-quiz-api",
    event,
    ...safeMetadata,
  });

  if (level === "error") {
    console.error(entry);
  } else if (level === "warn") {
    console.warn(entry);
  } else {
    console.log(entry);
  }
}

/**
 * Logger estruturado em JSON para requisições HTTP, erros e eventos críticos.
 */
export const logger = {
  info(event: string, metadata?: LogMetadata) {
    writeLog("info", event, metadata);
  },
  warn(event: string, metadata?: LogMetadata) {
    writeLog("warn", event, metadata);
  },
  error(event: string, metadata?: LogMetadata) {
    writeLog("error", event, metadata);
  },
};

