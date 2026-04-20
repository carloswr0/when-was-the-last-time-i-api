import type { NextFunction, Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { ErrorCode } from "../constants/error-codes.ts";
import ServerError, {
  apiErrorBodyFromServerError,
  internalErrorBody,
} from "../helpers/error.helper.ts";
import { sendError } from "../helpers/response.helper.ts";
import type { ReminderType } from "../models/Reminder.ts";
import reminderService from "../services/reminder.service.ts";

export type RequestWithReminder = Request & { reminder: ReminderType };

function reminderParamId(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  const s = Array.isArray(value) ? value[0] : value;
  return typeof s === "string" && s ? s : undefined;
}

async function verifyReminder(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const reminderId = reminderParamId(req.params.reminder_id);

  if (!reminderId) {
    const msg = "reminder_id is required";
    sendError(res, 400, {
      code: ErrorCode.VALIDATION_ERROR,
      details: [{ field: "reminder_id", message: msg }],
    }, msg);
    return;
  }

  if (!isValidObjectId(reminderId)) {
    const msg = "Invalid reminder ID format";
    sendError(res, 400, {
      code: ErrorCode.VALIDATION_ERROR,
      details: [{ field: "reminder_id", message: msg }],
    }, msg);
    return;
  }

  try {
    const reminder = await reminderService.getReminderById(reminderId);
    (req as RequestWithReminder).reminder = reminder;
    next();
  } catch (error) {
    if (error instanceof ServerError) {
      sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
      return;
    }
    sendError(res, 500, internalErrorBody("Internal server error"), "Internal server error");
  }
}

export default verifyReminder;
