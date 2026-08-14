import { redisConnection } from "../config/redis.js";
import { waitForSendSlot } from "./send-spacing.service.js";

async function testSendSpacing() {
  await redisConnection.del("email-scheduler:last-send-at");

  console.log("Testing send spacing...");

  const start = Date.now();

  for (let i = 1; i <= 4; i++) {
    await waitForSendSlot();

    const elapsed = Date.now() - start;

    console.log(
      `Email ${i} acquired send slot at ${elapsed}ms`
    );
  }

  await redisConnection.quit();
}

testSendSpacing().catch((error) => {
  console.error("Send spacing test failed:", error);
  process.exit(1);
});