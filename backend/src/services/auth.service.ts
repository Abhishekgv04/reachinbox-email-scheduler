import { OAuth2Client } from "google-auth-library";

import { prisma } from "../database/prisma.js";
import { env } from "../config/env.js";

const googleClient = new OAuth2Client(
  env.google.clientId
);

export interface AuthenticatedUser {
  id: string;
  googleId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export async function authenticateWithGoogle(
  credential: string
): Promise<AuthenticatedUser> {
  if (!credential) {
    throw new Error(
      "Google credential is required"
    );
  }

  const ticket =
    await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.google.clientId,
    });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error(
      "Invalid Google credential"
    );
  }

  if (!payload.sub) {
    throw new Error(
      "Google account ID is missing"
    );
  }

  if (!payload.email) {
    throw new Error(
      "Google email is missing"
    );
  }

  const googleId = payload.sub;
  const email = payload.email;
  const name =
    payload.name || "Google User";

  const avatarUrl =
    payload.picture || null;

  let user = await prisma.user.findUnique({
    where: {
      googleId,
    },
  });

  if (!user) {
    user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  if (user) {
    user = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        googleId,
        name,
        avatarUrl,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        googleId,
        name,
        email,
        avatarUrl,
      },
    });
  }

  return {
    id: user.id,
    googleId: user.googleId,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };
}