import type { Request, Response } from "express";
import { ErrorCode } from "../constants/error-codes.ts";
import { getAuthUserId } from "../helpers/authUser.helper.ts";
import { internalErrorBody } from "../helpers/error.helper.ts";
import { sendError, sendSuccess } from "../helpers/response.helper.ts";
import { serverErrorMessage } from "../helpers/serverErrorMessage.helper.ts";
import { reminderRepository } from "../repositories/reminder.repository.ts";
import { userRemindersGroupRepository } from "../repositories/user-reminders-group.repository.ts";

function remindersGroupIdFromMembership(
  m: { remindersGroup?: unknown },
): string | null {
  const g = m.remindersGroup;
  if (g == null) return null;
  if (typeof g === "string") return g;
  if (typeof g === "object" && g !== null) {
    const o = g as { _id?: unknown; id?: string };
    if (o._id != null) return String(o._id);
    if (o.id != null) return String(o.id);
  }
  return null;
}

class UserController {
  async getAllUserReminders(req: Request, res: Response): Promise<void> {
    try {
      const { user_id } = req.params;
      const authId = getAuthUserId(req);

      if (!authId) {
        const msg = "Unauthorized: user not authenticated";
        sendError(
          res,
          401,
          {
            code: ErrorCode.UNAUTHORIZED,
            details: [{ field: "authorization", message: msg }],
          },
          msg,
        );
        return;
      }

      if (user_id !== authId) {
        const msg = "You can only list your own reminders";
        sendError(
          res,
          403,
          {
            code: ErrorCode.FORBIDDEN,
            details: [{ field: "user_id", message: msg }],
          },
          msg,
        );
        return;
      }

      const memberships =
        await userRemindersGroupRepository.findByUserId(user_id);
      const groupIds = memberships
        .map(remindersGroupIdFromMembership)
        .filter((id): id is string => id != null);
      const reminders =
        await reminderRepository.findByRemindersGroupIds(groupIds);

      sendSuccess(res, 200, {reminders: reminders}, "success");
    } catch (error: unknown) {
      const detail = serverErrorMessage(error);
      sendError(res, 500, internalErrorBody(detail), detail);
    }
  }
}

export default UserController;
