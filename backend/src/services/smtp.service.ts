import nodemailer from "nodemailer";

interface SmtpConnectionInput {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
}

export async function testSmtpConnection(
  input: SmtpConnectionInput
) {
  if (
    !input.smtpHost ||
    !input.smtpPort ||
    !input.smtpUser ||
    !input.smtpPass
  ) {
    throw new Error(
      "SMTP host, port, username and password are required"
    );
  }

  const port = Number(input.smtpPort);

  const transporter = nodemailer.createTransport({
    host: input.smtpHost,
    port,

    // Gmail port 587 uses STARTTLS.
    // Port 465 uses direct TLS.
    secure: port === 465,

    // Explicitly request STARTTLS when using port 587.
    requireTLS: port === 587,

    auth: {
      user: input.smtpUser,
      pass: input.smtpPass,
    },

    tls: {
      rejectUnauthorized: false,
      servername: input.smtpHost,
    },

    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  try {
    await transporter.verify();

    return {
      success: true,
      message: "SMTP connection successful",
    };
  } finally {
    transporter.close();
  }
}
