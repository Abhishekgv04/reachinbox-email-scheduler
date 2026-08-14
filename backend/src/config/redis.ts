import { Redis } from "ioredis";
import { env } from "./env.js";

export const redisConnection = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("Redis connected");
});

redisConnection.on("error", (error: Error) => {
  console.error("Redis connection error:", error.message);
});