import nodemailer from "nodemailer";

export interface SmtpSender {
  name: string;
  email: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
}

export async function sendEmail(
  sender: SmtpSender,
  recipientEmail: string,
  subject: string,
  body: string
) {
  const transporter = nodemailer.createTransport({
    host: sender.smtpHost,
    port: sender.smtpPort,
    secure: sender.smtpPort === 465,

    auth: {
      user: sender.smtpUser,
      pass: sender.smtpPass,
    },

    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: `"${sender.name}" <${sender.email}>`,
    to: recipientEmail,
    subject,
    text: body,
  });

  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info) || null,
  };
}