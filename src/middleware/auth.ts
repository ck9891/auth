// Middleware to check if the user is authenticated
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/login";

export const authenticateUser = (
  req: Request & { user: string },
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;
  try {
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tokenString = token.split(" ")[1];

    const decoded = verifyToken(tokenString);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
