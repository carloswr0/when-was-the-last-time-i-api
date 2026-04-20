import type { Request, Response } from "express";
import { ErrorCode } from "../constants/error-codes.ts";
import { remindersGroupTypes } from "../constants/index.ts";
import ServerError, {
  apiErrorBodyFromServerError,
  internalErrorBody,
} from "../helpers/error.helper.ts";
import { sendError, sendSuccess } from "../helpers/response.helper.ts";
import { serverErrorMessage } from "../helpers/serverErrorMessage.helper.ts";
import { remindersGroupRepository } from "../repositories/reminders-group.repository.ts";
import { userRemindersGroupRepository } from "../repositories/user-reminders-group.repository.ts";

function isRemindersGroupType(
  value: unknown
): value is (typeof remindersGroupTypes)[number] {
  return (
    typeof value === "string" &&
    (remindersGroupTypes as readonly string[]).includes(value)
  );
}

/** Resolves authenticated user id from JWT/session payloads (Mongoose doc or plain object). */
function getAuthUserId(req: Request): string | undefined {
  const raw = (req as Request & { user?: unknown }).user as
    | { id?: string; _id?: unknown; _doc?: { id?: string; _id?: unknown } }
    | undefined;
  if (!raw) return undefined;
  const u = raw._doc ?? raw;
  if (typeof u.id === "string") return u.id;
  if (u._id != null) return String(u._id);
  return undefined;
}

class GroupsController {
  async createGroup(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, type } = req.body as { title: string; type: string, description?: string, };
      const userId = getAuthUserId(req);

      if (!userId) {
        const msg = "Unauthorized: user not authenticated";
        sendError(res, 401, {
          code: ErrorCode.UNAUTHORIZED,
          details: [{ field: "authorization", message: msg }],
        }, msg);
        return;
      }

      if (typeof title !== "string" || !title.trim()) {
        const msg = "Title is required";
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "title", message: msg }],
        }, msg);
        return;
      }

      if (!isRemindersGroupType(type)) {
        const msg = `type must be one of: ${remindersGroupTypes.join(", ")}`;
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "type", message: msg }],
        }, msg);
        return;
      }

      const createdGroup = await remindersGroupRepository.create({
        title: title.trim(),
        type,
        ...(description !== undefined ? { description } : {}),
      });

      if (!createdGroup) {
        const msg = "Failed to create reminders group"
        sendError(res, 500, internalErrorBody(msg), msg);
        return;
      }

      const created = createdGroup as typeof createdGroup & {
        _id?: unknown;
        id?: string;
      };
      const groupId =
        created.id != null
          ? String(created.id)
          : created._id != null
            ? String(created._id)
            : "";
      if (!groupId) {
        const msg = "Created group has no id"
        sendError(res, 500, internalErrorBody(msg), msg);
        return;
      }

      await userRemindersGroupRepository.create({
        user: userId,
        remindersGroup: groupId,
        role: "owner",
      });

      sendSuccess(res, 201, createdGroup, "success");
    } catch (error: unknown) {
      if (error instanceof ServerError) {
        sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
        return;
      }
      const msg = "Internal server error"
      sendError(res, 500, internalErrorBody(msg), msg);
    }
  }

  async getGroup(req: Request, res: Response): Promise<void> {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        const msg = "Unauthorized: user not authenticated";
        sendError(res, 401, {
          code: ErrorCode.UNAUTHORIZED,
          details: [{ field: "authorization", message: msg }],
        }, msg);
        return;
      }

      const groups =
        await userRemindersGroupRepository.findByUserId(userId);
      sendSuccess(res, 200, groups, "success");
    } catch (error: unknown) {
      const detail = serverErrorMessage(error);
      sendError(res, 500, internalErrorBody(detail), detail);
    }
  }

  async getGroupDetails(req: Request, res: Response): Promise<void> {
    try {
      const { group_id } = req.params as {
        group_id: string;
      };

      const groupMembers =
        await userRemindersGroupRepository.findByRemindersGroupId(group_id);

      const groupDetails =
        await remindersGroupRepository.findById(group_id);

      if (!groupDetails) {
        const msg = "Reminder group was not found"
        sendError(res, 404, {
          code: ErrorCode.NOT_FOUND,
          details: [{ field: "group_id", message: msg }],
        }, msg);
        return;
      }

      sendSuccess(
        res,
        200,
        { groupDetails, groupMembers },
        "success",
      );
    } catch (error: unknown) {
      const detail = serverErrorMessage(error);
      sendError(res, 500, internalErrorBody(detail), detail);
    }
  }
}

export default GroupsController;
