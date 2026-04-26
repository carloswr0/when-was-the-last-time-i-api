import type { UpdateQuery } from "mongoose";
import {
  ReminderHistoryModel,
  type ReminderHistoryType,
} from "../models/ReminderHistory.ts";

class ReminderHistoryRepository {
  private readonly reminderHistoryModel: typeof ReminderHistoryModel;

  constructor(reminderHistoryModel: typeof ReminderHistoryModel) {
    this.reminderHistoryModel = reminderHistoryModel;
  }

  async create(
    entry: Parameters<typeof ReminderHistoryModel.create>[0]
  ): Promise<ReminderHistoryType | null> {
    const doc = await this.reminderHistoryModel.create(entry);
    return doc?.toObject() as unknown as ReminderHistoryType | null;
  }

  async findByRemindersId(
    remindersId: string
  ): Promise<ReminderHistoryType[]> {
    const docs = await this.reminderHistoryModel
      .find({ parentReminder: remindersId })
      .sort({ lastUpdatedAt: -1 });
    return docs.map((d) => d.toObject() as unknown as ReminderHistoryType);
  }

  async getAll(): Promise<ReminderHistoryType[]> {
    const docs = await this.reminderHistoryModel.find();
    return docs.map((d) => d.toObject() as unknown as ReminderHistoryType);
  }
}

export const reminderHistoryRepository = new ReminderHistoryRepository(
  ReminderHistoryModel
);
