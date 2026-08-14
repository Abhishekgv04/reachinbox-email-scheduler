import { redisConnection } from "../config/redis.js";
import { checkAndConsumeRateLimit } from "./rate-limit.service.js";

async function testRateLimit() {
  const senderId = "test-sender";

  const testKeyPattern = `email-rate:${senderId}:*`;

  const keys = await redisConnection.keys(testKeyPattern);

  if (keys.length > 0) {
    await redisConnection.del(...keys);
  }

  console.log("Testing rate limiter...");

  for (let i = 1; i <= 5; i++) {
    const result = await checkAndConsumeRateLimit(senderId, 3);

    console.log(`Email ${i}:`, result);
  }

  await redisConnection.quit();
}

testRateLimit().catch((error) => {
  console.error("Rate limiter test failed:", error);
  process.exit(1);
});