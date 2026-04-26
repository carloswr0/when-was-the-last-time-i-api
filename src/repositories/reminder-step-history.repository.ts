import type { UpdateQuery } from "mongoose";
import {
  ReminderStepHistoryModel,
  type ReminderStepHistoryType,
} from "../models/ReminderStepHistory.ts";

class ReminderStepHistoryRepository {
  private readonly reminderStepHistoryModel: typeof ReminderStepHistoryModel;

  constructor(reminderStepHistoryModel: typeof ReminderStepHistoryModel) {
    this.reminderStepHistoryModel = reminderStepHistoryModel;
  }

  async create(
    entry: Parameters<typeof ReminderStepHistoryModel.create>[0]
  ): Promise<ReminderStepHistoryType | null> {
    const doc = await this.reminderStepHistoryModel.create(entry);
    return doc?.toObject() as unknown as ReminderStepHistoryType | null;
  }

  async findById(id: string): Promise<ReminderStepHistoryType | null> {
    const doc = await this.reminderStepHistoryModel.findById(id);
    return doc?.toObject() as unknown as ReminderStepHistoryType | null;
  }

  async findByRemindersGroupId(
    remindersGroupId: string
  ): Promise<ReminderStepHistoryType[]> {
    const docs = await this.reminderStepHistoryModel
      .find({ remindersGroup: remindersGroupId })
      .sort({ lastUpdatedAt: -1 });
    return docs.map((d) => d.toObject() as unknown as ReminderStepHistoryType);
  }

  async getAll(): Promise<ReminderStepHistoryType[]> {
    const docs = await this.reminderStepHistoryModel.find();
    return docs.map((d) => d.toObject() as unknown as ReminderStepHistoryType);
  }

  async update(
    id: string,
    update: UpdateQuery<ReminderStepHistoryType>
  ): Promise<ReminderStepHistoryType | null> {
    const doc = await this.reminderStepHistoryModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    return doc?.toObject() as unknown as ReminderStepHistoryType | null;
  }

  async delete(id: string): Promise<ReminderStepHistoryType | null> {
    const doc = await this.reminderStepHistoryModel.findByIdAndDelete(id);
    return doc?.toObject() as unknown as ReminderStepHistoryType | null;
  }
}

export const reminderHistoryRepository = new ReminderStepHistoryRepository(
  ReminderStepHistoryModel
);
