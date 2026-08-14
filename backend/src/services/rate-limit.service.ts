import { redisConnection } from "../config/redis.js";
import { env } from "../config/env.js";

const RATE_LIMIT_PREFIX = "email-rate";

function getHourWindow(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");

  return `${year}-${month}-${day}-${hour}`;
}

function getNextHourStart(date: Date): Date {
  const nextHour = new Date(date);
  nextHour.setUTCMinutes(0, 0, 0);
  nextHour.setUTCHours(nextHour.getUTCHours() + 1);

  return nextHour;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAt?: Date;
  count?: number;
}

export async function checkAndConsumeRateLimit(
  senderId: string,
  limit: number = env.email.maxPerHour
): Promise<RateLimitResult> {
  const now = new Date();

  const hourWindow = getHourWindow(now);

  const key = `${RATE_LIMIT_PREFIX}:${senderId}:${hourWindow}`;

  const count = await redisConnection.incr(key);

  if (count === 1) {
    await redisConnection.expire(key, 60 * 60 * 2);
  }

  if (count > limit) {
    await redisConnection.decr(key);

    return {
      allowed: false,
      retryAt: getNextHourStart(now),
      count: count - 1,
    };
  }

  return {
    allowed: true,
    count,
  };
}