import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import prisma from "../prisma";

const REFRESH_TOKEN_EXPIRATION = 14 * 24 * 60 * 60 * 1000; // 14 days
const ACCESS_TOKEN_EXPIRATION = 15 * 60 * 1000; // 15 minutes

export function generateRefreshToken(user: User) {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });
  return token;
}

export function assignToken(user: User) {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });
  return token;
}

export async function generateTokens(
  user: User,
  ip: string,
  userAgent: string
) {
  try {
    const accessToken = assignToken(user);
    const refreshToken = generateRefreshToken(user);

    const refreshTokenRecord = await prisma.refreshToken.create({
      data: {
        token_identifier: refreshToken,
        user_id: user.id,
        is_valid: true,
        created_at: new Date(),
        expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION),
        issued_by_ip: ip,
        user_agent: userAgent,
      },
    });

    if (!refreshTokenRecord) {
      throw new Error("Failed to create refresh token record");
    }

    return { accessToken, refreshToken };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate tokens: " + error.message);
  }
}

export async function verifyToken(token: string) {
  try {
    const refreshTokenRecord = await prisma.refreshToken.findUnique({
      where: {
        token_identifier: token,
      },
    });

    if (!refreshTokenRecord) {
      throw new Error("Refresh token not found");
    }

    if (!refreshTokenRecord.is_valid) {
      throw new Error("Refresh token is not valid");
    }

    if (refreshTokenRecord.expires_at < new Date()) {
      await invalidateRefreshToken(token);
      throw new Error("Refresh token has expired");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to verify token: " + error.message);
  }
}

export async function invalidateRefreshToken(token: string) {
  await prisma.refreshToken.update({
    where: { token_identifier: token },
    data: { is_valid: false },
  });
}