import nodemailer from "nodemailer";
import { sendEmail } from "./email.service.js";

async function testEmail() {
  try {
    const account = await nodemailer.createTestAccount();

    const sender = {
      name: "ReachInbox Demo",
      email: account.user,
      smtpHost: account.smtp.host,
      smtpPort: account.smtp.port,
      smtpUser: account.user,
      smtpPass: account.pass,
    };

    const result = await sendEmail(
      sender,
      "recipient@example.com",
      "ReachInbox Scheduler Test",
      "This is a test email from the ReachInbox email scheduler."
    );

    console.log("Email sent successfully!");
    console.log("Message ID:", result.messageId);
    console.log("Preview URL:", result.previewUrl);
  } catch (error) {
    console.error("Email sending failed:", error);
    process.exit(1);
  }
}

testEmail();