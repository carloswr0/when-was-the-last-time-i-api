import type { Request, Response } from "express";
import { reminderTypes } from "../constants/index.ts";
import ServerError from "../helpers/error.helper.ts";
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
      } = req.body as {
        title?: unknown;
        type?: unknown;
        description?: unknown;
        icon?: unknown;
        bannerImage?: unknown;
      };

      if (typeof title !== "string" || !title.trim()) {
        res.status(400).json({
          message: "Title is required",
          status: 400,
          ok: false,
        });
        return;
      }

      if (!isReminderType(type)) {
        res.status(400).json({
          message: `type must be one of: ${reminderTypes.join(", ")}`,
          status: 400,
          ok: false,
        });
        return;
      }

      const reminder = await reminderService.createReminder({
        title,
        type,
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

      res.status(201).json({
        ok: true,
        status: 201,
        message: "Reminder created successfully",
        data: { reminder },
      });
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

  async getAllReminders(_req: Request, res: Response): Promise<void> {
    try {
      const reminders = await reminderService.getAllReminders();
      res.status(200).json({
        ok: true,
        status: 200,
        message: "Reminders retrieved successfully",
        data: { reminders },
      });
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

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const reminderId = routeParamId(req.params.reminder_id);
      if (!reminderId) {
        res.status(400).json({
          message: "reminder_id is required",
          status: 400,
          ok: false,
        });
        return;
      }
      const reminder = await reminderService.getReminderById(reminderId);
      res.status(200).json({
        ok: true,
        status: 200,
        message: "Reminder retrieved successfully",
        data: { reminder },
      });
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

  async updateReminder(req: Request, res: Response): Promise<void> {
    try {
      const reminderId = routeParamId(req.params.reminder_id);
      if (!reminderId) {
        res.status(400).json({
          message: "reminder_id is required",
          status: 400,
          ok: false,
        });
        return;
      }
      const body = req.body as Record<string, unknown>;
      const update: Record<string, unknown> = {};

      if ("title" in body) {
        if (typeof body.title !== "string" || !body.title.trim()) {
          res.status(400).json({
            message: "title must be a non-empty string",
            status: 400,
            ok: false,
          });
          return;
        }
        update.title = body.title.trim();
      }
      if ("type" in body) {
        if (!isReminderType(body.type)) {
          res.status(400).json({
            message: `type must be one of: ${reminderTypes.join(", ")}`,
            status: 400,
            ok: false,
          });
          return;
        }
        update.type = body.type;
      }
      if ("description" in body) {
        if (body.description != null && typeof body.description !== "string") {
          res.status(400).json({
            message: "description must be a string or null",
            status: 400,
            ok: false,
          });
          return;
        }
        update.description = body.description;
      }
      if ("icon" in body) {
        if (body.icon != null && typeof body.icon !== "string") {
          res.status(400).json({
            message: "icon must be a string or null",
            status: 400,
            ok: false,
          });
          return;
        }
        update.icon = body.icon;
      }
      if ("bannerImage" in body) {
        if (
          body.bannerImage != null &&
          typeof body.bannerImage !== "string"
        ) {
          res.status(400).json({
            message: "bannerImage must be a string or null",
            status: 400,
            ok: false,
          });
          return;
        }
        update.bannerImage = body.bannerImage;
      }

      if (Object.keys(update).length === 0) {
        res.status(400).json({
          message: "No valid fields to update",
          status: 400,
          ok: false,
        });
        return;
      }

      const reminder = await reminderService.updateReminder(reminderId, update);
      res.status(200).json({
        ok: true,
        status: 200,
        message: "Reminder updated successfully",
        data: { reminder },
      });
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

  async deleteReminder(req: Request, res: Response): Promise<void> {
    try {
      const reminderId = routeParamId(req.params.reminder_id);
      if (!reminderId) {
        res.status(400).json({
          message: "reminder_id is required",
          status: 400,
          ok: false,
        });
        return;
      }
      await reminderService.deleteReminder(reminderId);
      res.status(200).json({
        ok: true,
        status: 200,
        message: "Reminder deleted successfully",
      });
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
}

const reminderController = new ReminderController();

export default reminderController;
