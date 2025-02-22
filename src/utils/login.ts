import jwt from "jsonwebtoken";
import { User } from "@prisma/client";

export function assignToken(user: User) {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
  return token;
}

export function verifyToken(token: string) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
}