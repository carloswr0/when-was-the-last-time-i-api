import type { Request } from "express";

/** Resolves authenticated user id from JWT/session payloads (Mongoose doc or plain object). */
export function getAuthUserId(req: Request): string | undefined {
  const raw = (req as Request & { user?: unknown }).user as
    | { id?: string; _id?: unknown; _doc?: { id?: string; _id?: unknown } }
    | undefined;
  if (!raw) return undefined;
  const u = raw._doc ?? raw;
  if (typeof u.id === "string") return u.id;
  if (u._id != null) return String(u._id);
  return undefined;
}
