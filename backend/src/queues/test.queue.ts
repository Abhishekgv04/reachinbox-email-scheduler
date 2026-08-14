import { emailQueue } from "./email.queue.js";

async function testQueue() {
  const job = await emailQueue.add(
    "test-email",
    {
      emailJobId: "test-email-job",
    },
    {
      delay: 5000,
    }
  );

  console.log("BullMQ test job created:", job.id);

  await emailQueue.close();
}

testQueue().catch((error) => {
  console.error("BullMQ test failed:", error);
  process.exit(1);
});