import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { ErrorCode } from "../constants/error-codes.ts";
import { reminderTypes } from "../constants/index.ts";
import { getAuthUserId } from "../helpers/authUser.helper.ts";
import ServerError, {
  apiErrorBodyFromServerError,
  internalErrorBody,
} from "../helpers/error.helper.ts";
import { sendError, sendSuccess } from "../helpers/response.helper.ts";
import reminderService from "../services/reminder.service.ts";

function isReminderType(
  value: unknown,
): value is (typeof reminderTypes)[number] {
  return (
    typeof value === "string" &&
    (reminderTypes as readonly string[]).includes(value)
  );
}

function routeParamId(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  const s = Array.isArray(value) ? value[0] : value;
  return typeof s === "string" && s ? s : undefined;
}

class ReminderController {
  async createReminder(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        type,
        description,
        icon,
        bannerImage,
        frequency,
        remindersGroup,
      } = req.body as {
        title?: string;
        type?: string;
        description?: string;
        icon?: string;
        bannerImage?: string;
        frequency: number;
        remindersGroup: string;
      };
      const groupId = routeParamId(req.params.group_id);

      if (!groupId) {
        const msg = "Reminders group id is required";
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "groupId", message: msg }],
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

      if (!isReminderType(type)) {
        const msg = `type must be one of: ${reminderTypes.join(", ")}`;
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "type", message: msg }],
        }, msg);
        return;
      }

      const reminder = await reminderService.createReminder({
        title,
        type,
        frequency,
        remindersGroup: groupId,
        description:
          typeof description === "string" || description === null
            ? description
            : undefined,
        icon: typeof icon === "string" || icon === null ? icon : undefined,
        bannerImage:
          typeof bannerImage === "string" || bannerImage === null
            ? bannerImage
            : undefined,
      });

      sendSuccess(res, 201, { reminder }, "Reminder created successfully");
    } catch (error) {
      if (error instanceof ServerError) {
        sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
        return;
      }
      sendError(res, 500, internalErrorBody("Internal server error"), "Internal server error");
    }
  }

  async getAllReminders(_req: Request, res: Response): Promise<void> {
    try {
      const reminders = await reminderService.getAllReminders();
      sendSuccess(res, 200, { reminders }, "Reminders retrieved successfully");
    } catch (error) {
      if (error instanceof ServerError) {
        sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
        return;
      }
      sendError(res, 500, internalErrorBody("Internal server error"), "Internal server error");
    }
  }

  async getRemindersByGroupId(req: Request, res: Response): Promise<void> {
    try {
      const groupId = routeParamId(req.params.group_id);
      if (!groupId) {
        const msg = "group_id is required";
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "group_id", message: msg }],
        }, msg);
        return;
      }
      if (!isValidObjectId(groupId)) {
        const msg = "Invalid group ID format";
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "group_id", message: msg }],
        }, msg);
        return;
      }

      const reminders = await reminderService.getRemindersByGroupId(groupId);
      sendSuccess(res, 200, { reminders }, "Reminders retrieved successfully");
    } catch (error) {
      if (error instanceof ServerError) {
        sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
        return;
      }
      sendError(res, 500, internalErrorBody("Internal server error"), "Internal server error");
    }
  }

  async getRemindersByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = routeParamId(req.params.user_id);
      if (!userId) {
        const msg = "user_id is required";
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "user_id", message: msg }],
        }, msg);
        return;
      }
      if (!isValidObjectId(userId)) {
        const msg = "Invalid user ID format";
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "user_id", message: msg }],
        }, msg);
        return;
      }

      const reminders = await reminderService.getRemindersByUserId(userId);
      sendSuccess(res, 200, { reminders }, "Reminders retrieved successfully");
    } catch (error) {
      if (error instanceof ServerError) {
        sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
        return;
      }
      sendError(res, 500, internalErrorBody("Internal server error"), "Internal server error");
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const reminderId = routeParamId(req.params.reminder_id);
      if (!reminderId) {
        const msg = "reminder_id is required";
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "reminder_id", message: msg }],
        }, msg);
        return;
      }
      const reminder = await reminderService.getReminderById(reminderId);
      sendSuccess(res, 200, { reminder }, "Reminder retrieved successfully");
    } catch (error) {
      if (error instanceof ServerError) {
        sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
        return;
      }
      sendError(res, 500, internalErrorBody("Internal server error"), "Internal server error");
    }
  }

  async updateReminder(req: Request, res: Response): Promise<void> {
    try {
      const reminderId = routeParamId(req.params.reminder_id);
      if (!reminderId) {
        const msg = "reminder_id is required";
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "reminder_id", message: msg }],
        }, msg);
        return;
      }
      const body = req.body as Record<string, unknown>;
      const update: Record<string, unknown> = {};

      if ("title" in body) {
        if (typeof body.title !== "string" || !body.title.trim()) {
          const msg = "title must be a non-empty string";
          sendError(res, 400, {
            code: ErrorCode.VALIDATION_ERROR,
            details: [{ field: "title", message: msg }],
          }, msg);
          return;
        }
        update.title = body.title.trim();
      }
      if ("type" in body) {
        if (!isReminderType(body.type)) {
          const msg = `type must be one of: ${reminderTypes.join(", ")}`;
          sendError(res, 400, {
            code: ErrorCode.VALIDATION_ERROR,
            details: [{ field: "type", message: msg }],
          }, msg);
          return;
        }
        update.type = body.type;
      }
      if ("description" in body) {
        if (body.description != null && typeof body.description !== "string") {
          const msg = "description must be a string or null";
          sendError(res, 400, {
            code: ErrorCode.VALIDATION_ERROR,
            details: [{ field: "description", message: msg }],
          }, msg);
          return;
        }
        update.description = body.description;
      }
      if ("icon" in body) {
        if (body.icon != null && typeof body.icon !== "string") {
          const msg = "icon must be a string or null";
          sendError(res, 400, {
            code: ErrorCode.VALIDATION_ERROR,
            details: [{ field: "icon", message: msg }],
          }, msg);
          return;
        }
        update.icon = body.icon;
      }
      if ("bannerImage" in body) {
        if (
          body.bannerImage != null &&
          typeof body.bannerImage !== "string"
        ) {
          const msg = "bannerImage must be a string or null";
          sendError(res, 400, {
            code: ErrorCode.VALIDATION_ERROR,
            details: [{ field: "bannerImage", message: msg }],
          }, msg);
          return;
        }
        update.bannerImage = body.bannerImage;
      }

      if (Object.keys(update).length === 0) {
        const msg = "No valid fields to update";
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "body", message: msg }],
        }, msg);
        return;
      }

      const reminder = await reminderService.updateReminder(reminderId, update);
      sendSuccess(res, 200, { reminder }, "Reminder updated successfully");
    } catch (error) {
      if (error instanceof ServerError) {
        sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
        return;
      }
      sendError(res, 500, internalErrorBody("Internal server error"), "Internal server error");
    }
  }

  async completeReminder(req: Request, res: Response): Promise<void> {
    try {
      const reminderId = routeParamId(req.params.reminder_id);
      if (!reminderId) {
        const msg = "reminder_id is required";
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "reminder_id", message: msg }],
        }, msg);
        return;
      }

      const lastUpdatedBy = getAuthUserId(req);
      if (!lastUpdatedBy) {
        const msg = "Unauthorized: user not authenticated";
        sendError(res, 401, {
          code: ErrorCode.UNAUTHORIZED,
          details: [{ field: "authorization", message: msg }],
        }, msg);
        return;
      }

      const lastUpdatedAt = Date.now();

      const reminder = await reminderService.markReminderAsDone(
        reminderId,
        lastUpdatedBy,
        lastUpdatedAt,
      );
      sendSuccess(res, 200, { reminder }, "Reminder marked as done successfully");
    } catch (error) {
      if (error instanceof ServerError) {
        sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
        return;
      }
      sendError(res, 500, internalErrorBody("Internal server error"), "Internal server error");
    }
  }

  async deleteReminder(req: Request, res: Response): Promise<void> {
    try {
      const reminderId = routeParamId(req.params.reminder_id);
      if (!reminderId) {
        const msg = "reminder_id is required";
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "reminder_id", message: msg }],
        }, msg);
        return;
      }
      await reminderService.deleteReminder(reminderId);
      sendSuccess(res, 200, null, "Reminder deleted successfully");
    } catch (error) {
      if (error instanceof ServerError) {
        sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
        return;
      }
      sendError(res, 500, internalErrorBody("Internal server error"), "Internal server error");
    }
  }

}

const reminderController = new ReminderController();

export default reminderController;
