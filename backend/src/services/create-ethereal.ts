import nodemailer from "nodemailer";

async function createEtherealAccount() {
  const account = await nodemailer.createTestAccount();

  console.log("");
  console.log("======================================");
  console.log("        ETHEREAL SMTP ACCOUNT");
  console.log("======================================");
  console.log("");
  console.log("User:", account.user);
  console.log("Password:", account.pass);
  console.log("SMTP Host:", account.smtp.host);
  console.log("SMTP Port:", account.smtp.port);
  console.log("");
  console.log("======================================");
}

createEtherealAccount().catch((error) => {
  console.error(
    "Failed to create Ethereal account:",
    error
  );

  process.exit(1);
});