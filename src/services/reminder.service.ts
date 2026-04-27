import type { UpdateQuery } from "mongoose";
import { reminderTypes } from "../constants/index.ts";
import ServerError from "../helpers/error.helper.ts";
import type { ReminderType } from "../models/Reminder.ts";
import { reminderRepository } from "../repositories/reminder.repository.ts";
import { reminderHistoryRepository } from "../repositories/reminder-history.repository.ts";
import { userRemindersGroupRepository } from "../repositories/user-reminders-group.repository.ts";

export type CreateReminderParams = {
  title: string;
  type: (typeof reminderTypes)[number];
  description?: string | null | undefined;
  icon?: string | null | undefined;
  bannerImage?: string | null | undefined;
  frequency: number;
  remindersGroup: string;
};

class ReminderService {
  async createReminder(params: CreateReminderParams): Promise<ReminderType> {
    const { title, type, description, icon, bannerImage, frequency, remindersGroup } =
      params;
    console.log(title, type, description, icon, bannerImage, frequency)
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
      frequency,
      remindersGroup: remindersGroup,
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

  async getRemindersByGroupId(groupId: string): Promise<ReminderType[]> {
    if (!groupId?.trim()) {
      throw new ServerError({
        status: 400,
        message: "Group ID is required",
        ok: false,
      });
    }
    return reminderRepository.findByRemindersGroupIds([groupId.trim()]);
  }

  async getRemindersByUserId(userId: string): Promise<ReminderType[]> {
    if (!userId?.trim()) {
      throw new ServerError({
        status: 400,
        message: "User ID is required",
        ok: false,
      });
    }

    const memberships =
      await userRemindersGroupRepository.findByUserId(userId.trim());
    const groupIds = memberships
      .map((m) => {
        const g = m.remindersGroup as unknown;
        if (g == null) return null;
        if (typeof g === "string") return g;
        if (typeof g === "object" && g !== null) {
          const doc = g as { _id?: unknown; id?: string };
          if (doc._id != null) return String(doc._id);
          if (doc.id != null) return doc.id;
        }
        return String(g);
      })
      .filter((id): id is string => Boolean(id));

    return reminderRepository.findByRemindersGroupIds(groupIds);
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

  async markReminderAsDone(
    id: string,
    lastUpdatedBy: string,
    lastUpdatedAt: number,
  ): Promise<ReminderType> {
    if (!id) {
      throw new ServerError({
        status: 400,
        message: "Reminder ID is required",
        ok: false,
      });
    }

    const updated = await reminderRepository.markAsDone(id, lastUpdatedBy, lastUpdatedAt);
    await reminderHistoryRepository.create({
      reminder: id,
      lastUpdatedBy: lastUpdatedBy,
      lastUpdatedAt: lastUpdatedAt
    });

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
