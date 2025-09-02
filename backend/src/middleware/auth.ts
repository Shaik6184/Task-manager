import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

const JWT_SECRET = () => requireEnv("JWT_SECRET");

export function signJwt(payload: { id: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET(), { expiresIn: "7d" });
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers["authorization"];
    if (!header) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Invalid Authorization header" });
    }

    const decoded = jwt.verify(token, JWT_SECRET()) as { id: string; email: string };
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}


