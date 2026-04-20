import jwt, { type JwtPayload, type VerifyErrors } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { ErrorCode } from "../constants/error-codes.ts";
import ENVIRONTMENT from "../config/environment.config.ts";
import { internalErrorBody } from "../helpers/error.helper.ts";
import { sendError } from "../helpers/response.helper.ts";

function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const secret = ENVIRONTMENT.JWT_SECRET_KEY;
    if (!secret) {
      sendError(res, 500, internalErrorBody("Internal server error"), "Internal server error");
      return;
    }

    const raw = req.headers.authorization;
    const bearer = Array.isArray(raw) ? raw[0] : raw;
    const token = bearer?.split(" ")[1]; // Bearer <token>

    if (!token) {
      const msg = "No token provided";
      sendError(res, 401, {
        code: ErrorCode.UNAUTHORIZED,
        details: [{ field: "authorization", message: msg }],
      }, msg);
      return;
    }

    jwt.verify(
      token,
      secret,
      (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
        if (err) {
          const msg = "Invalid token";
          sendError(res, 403, {
            code: ErrorCode.TOKEN_INVALID,
            details: [{ field: "authorization", message: msg }],
          }, msg);
          return;
        }
        if (typeof decoded === "string" || decoded === undefined) {
          const msg = "Invalid token";
          sendError(res, 403, {
            code: ErrorCode.TOKEN_INVALID,
            details: [{ field: "authorization", message: msg }],
          }, msg);
          return;
        }
        (req as Request & { user: JwtPayload }).user = decoded;
        next();
      },
    );
  } catch {
    const msg = "Internal server error"
    sendError(res, 500, internalErrorBody(msg), msg);
  }
}

export default authMiddleware;
