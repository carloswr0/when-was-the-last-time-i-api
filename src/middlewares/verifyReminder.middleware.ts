import type { NextFunction, Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import ServerError from "../helpers/error.helper.ts";
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
    res.status(400).json({
      message: "reminder_id is required",
      status: 400,
      ok: false,
    });
    return;
  }

  if (!isValidObjectId(reminderId)) {
    res.status(400).json({
      message: "Invalid reminder ID format",
      status: 400,
      ok: false,
    });
    return;
  }

  try {
    const reminder = await reminderService.getReminderById(reminderId);
    (req as RequestWithReminder).reminder = reminder;
    next();
  } catch (error) {
    if (error instanceof ServerError) {
      res.status(error.status).json({
        message: error.message,
        status: error.status,
        ok: false,
      });
      return;
    }
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      ok: false,
    });
  }
}

export default verifyReminder;
