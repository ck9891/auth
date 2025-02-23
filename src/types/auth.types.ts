import { Request } from 'express';
import { User } from "@prisma/client";

export interface JWTPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: JWTPayload;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
} 