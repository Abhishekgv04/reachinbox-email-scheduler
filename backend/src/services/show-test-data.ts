import { prisma } from "../database/prisma.js";

async function main() {
  console.log("\n========== USERS ==========\n");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (users.length === 0) {
    console.log("No users found.");
  } else {
    for (const user of users) {
      console.log(`User ID : ${user.id}`);
      console.log(`Name    : ${user.name}`);
      console.log(`Email   : ${user.email}`);
      console.log("----------------------------");
    }
  }

  console.log("\n========== SENDERS ==========\n");

  const senders = await prisma.sender.findMany({
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      smtpHost: true,
      smtpPort: true,
      hourlyLimit: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (senders.length === 0) {
    console.log("No senders found.");
  } else {
    for (const sender of senders) {
      console.log(`Sender ID : ${sender.id}`);
      console.log(`User ID   : ${sender.userId}`);
      console.log(`Name      : ${sender.name}`);
      console.log(`Email     : ${sender.email}`);
      console.log(`SMTP Host : ${sender.smtpHost}`);
      console.log(`SMTP Port : ${sender.smtpPort}`);
      console.log(`Hourly    : ${sender.hourlyLimit}`);
      console.log("----------------------------");
    }
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error("Failed to read test data:", error);

  await prisma.$disconnect();

  process.exit(1);
});