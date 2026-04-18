import jwt, { type JwtPayload, type VerifyErrors } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import ENVIRONTMENT from "../config/environment.config.js";

function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const secret = ENVIRONTMENT.JWT_SECRET_KEY;
    if (!secret) {
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    const raw = req.headers.authorization;
    const bearer = Array.isArray(raw) ? raw[0] : raw;
    const token = bearer?.split(" ")[1]; // Bearer <token>

    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    jwt.verify(
      token,
      secret,
      (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
        if (err) {
          res.status(403).json({ message: "Invalid token" });
          return;
        }
        if (typeof decoded === "string" || decoded === undefined) {
          res.status(403).json({ message: "Invalid token" });
          return;
        }
        (req as Request & { user: JwtPayload }).user = decoded;
        next();
      },
    );
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}

export default authMiddleware;
