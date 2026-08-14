import { redisConnection } from "../config/redis.js";
import { env } from "../config/env.js";

const LAST_SEND_KEY = "email-scheduler:last-send-at";

const ACQUIRE_SEND_SLOT_SCRIPT = `
local key = KEYS[1]
local minDelay = tonumber(ARGV[1])

local time = redis.call("TIME")
local now = (tonumber(time[1]) * 1000) + math.floor(tonumber(time[2]) / 1000)

local lastSend = redis.call("GET", key)

if not lastSend then
    redis.call("SET", key, tostring(now), "PX", minDelay * 2)
    return 0
end

local elapsed = now - tonumber(lastSend)

if elapsed >= minDelay then
    redis.call("SET", key, tostring(now), "PX", minDelay * 2)
    return 0
end

return minDelay - elapsed
`;

export async function waitForSendSlot(): Promise<void> {
  while (true) {
    const waitTime = Number(
      await redisConnection.eval(
        ACQUIRE_SEND_SLOT_SCRIPT,
        1,
        LAST_SEND_KEY,
        env.email.minDelayMs
      )
    );

    if (waitTime === 0) {
      return;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, waitTime)
    );
  }
}