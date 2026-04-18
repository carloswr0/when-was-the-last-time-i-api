import type { UpdateQuery } from "mongoose";
import { reminderTypes } from "../constants/index.ts";
import ServerError from "../helpers/error.helper.ts";
import type { ReminderType } from "../models/Reminder.ts";
import { reminderRepository } from "../repositories/reminder.repository.ts";

export type CreateReminderParams = {
  title: string;
  type: (typeof reminderTypes)[number];
  description?: string | null | undefined;
  icon?: string | null | undefined;
  bannerImage?: string | null | undefined;
};

class ReminderService {
  async createReminder(params: CreateReminderParams): Promise<ReminderType> {
    const { title, type, description, icon, bannerImage } = params;
    if (!title?.trim()) {
      throw new ServerError({
        status: 400,
        message: "Title is required",
        ok: false,
      });
    }

    const created = await reminderRepository.create({
      title: title.trim(),
      type,
      description: description ?? null,
      icon: icon ?? null,
      bannerImage: bannerImage ?? null,
    });

    if (!created) {
      throw new ServerError({
        status: 500,
        message: "Failed to create reminder",
        ok: false,
      });
    }

    return created;
  }

  async getAllReminders(): Promise<ReminderType[]> {
    return reminderRepository.getAll();
  }

  async getReminderById(id: string): Promise<ReminderType> {
    if (!id) {
      throw new ServerError({
        status: 400,
        message: "Reminder ID is required",
        ok: false,
      });
    }

    const reminder = await reminderRepository.findById(id);
    if (!reminder) {
      throw new ServerError({
        status: 404,
        message: "Reminder not found",
        ok: false,
      });
    }
    return reminder;
  }

  async updateReminder(
    id: string,
    update: UpdateQuery<ReminderType>,
  ): Promise<ReminderType> {
    if (!id) {
      throw new ServerError({
        status: 400,
        message: "Reminder ID is required",
        ok: false,
      });
    }

    const updated = await reminderRepository.update(id, update);
    if (!updated) {
      throw new ServerError({
        status: 404,
        message: "Reminder not found",
        ok: false,
      });
    }
    return updated;
  }

  async deleteReminder(id: string): Promise<ReminderType> {
    if (!id) {
      throw new ServerError({
        status: 400,
        message: "Reminder ID is required",
        ok: false,
      });
    }

    const deleted = await reminderRepository.delete(id);
    if (!deleted) {
      throw new ServerError({
        status: 404,
        message: "Reminder not found",
        ok: false,
      });
    }
    return deleted;
  }
}

const reminderService = new ReminderService();

export default reminderService;
