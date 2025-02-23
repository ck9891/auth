import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import prisma from "../prisma";
import { JWTPayload, TokenResponse } from '../types/auth.types';

const REFRESH_TOKEN_EXPIRATION = 14 * 24 * 60 * 60 * 1000; // 14 days
const ACCESS_TOKEN_EXPIRATION = 15 * 60 * 1000; // 15 minutes

/**
 * Generates a JWT access token for a user
 * @param user User object containing id and other user details
 * @returns JWT access token string
 */
export function generateRefreshToken(user: User) {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });
  console.log('Generated refresh token:', token);
  return token;
}

/**
 * Generates a JWT access token for a user
 * @param user User object containing id and other user details
 * @returns JWT access token string
 */
export function assignToken(user: User) {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });
  return token;
}

/**
 * Generates both access and refresh tokens for a user
 * @param user User object
 * @param ip IP address of the request
 * @param userAgent User agent string from the request
 * @returns Object containing access and refresh tokens
 */
export async function generateTokens(
  user: User,
  ip: string,
  userAgent: string
): Promise<TokenResponse> {
  try {
    const accessToken = assignToken(user);
    const refreshToken = generateRefreshToken(user);

    console.log('About to store refresh token:', refreshToken);

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
    console.error('Error in generateTokens:', error);
    throw new Error("Failed to generate tokens: " + error.message);
  }
}

/**
 * Verifies a refresh token against the database
 * @param token Refresh token string to verify
 * @returns Decoded JWT payload if valid
 * @throws Error if token is invalid, expired, or not found
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    console.log('Attempting to verify token:', token);
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

export async function renewTokens(refreshToken: string, ip: string, userAgent: string) {
  const decoded = await verifyToken(refreshToken);
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return generateTokens(user, ip, userAgent);
}
