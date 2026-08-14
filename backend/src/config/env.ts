import "dotenv/config";

function getNumberEnv(
  name: string,
  defaultValue: number
): number {
  const value = process.env[name];

  if (!value) {
    return defaultValue;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(
      `${name} must be a valid number`
    );
  }

  return parsed;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} environment variable is required`
    );
  }

  return value;
}

export const env = {
  port: getNumberEnv("PORT", 5000),

  redis: {
  host:
    process.env.REDIS_HOST ||
    "localhost",

  port: getNumberEnv(
    "REDIS_PORT",
    6379
  ),

  password:
    process.env.REDIS_PASSWORD || "",

  tls:
    process.env.REDIS_TLS === "true",
},

  worker: {
    concurrency: getNumberEnv(
      "WORKER_CONCURRENCY",
      5
    ),
  },

  email: {
    minDelayMs: getNumberEnv(
      "MIN_EMAIL_DELAY_MS",
      2000
    ),

    maxPerHour: getNumberEnv(
      "MAX_EMAILS_PER_HOUR",
      200
    ),
  },

  google: {
    clientId: getRequiredEnv(
      "GOOGLE_CLIENT_ID"
    ),
  },

  frontendUrl:
    process.env.FRONTEND_URL ||
    "http://localhost:5173",
};