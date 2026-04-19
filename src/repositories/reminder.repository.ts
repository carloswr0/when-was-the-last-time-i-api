import type { UpdateQuery } from "mongoose";
import { ReminderModel, type ReminderType } from "../models/Reminder.ts";

class ReminderRepository {
  private readonly reminderModel: typeof ReminderModel;

  constructor(reminderModel: typeof ReminderModel) {
    this.reminderModel = reminderModel;
  }

  async create(
    reminder: Parameters<typeof ReminderModel.create>[0]
  ): Promise<ReminderType | null> {
    const doc = await this.reminderModel.create(reminder);
    return doc?.toObject() as unknown as ReminderType | null;
  }

  async findById(id: string): Promise<ReminderType | null> {
    const doc = await this.reminderModel.findById(id);
    return doc?.toObject() as unknown as ReminderType | null;
  }

  async getAll(): Promise<ReminderType[]> {
    const docs = await this.reminderModel.find();
    return docs.map((d) => d.toObject() as unknown as ReminderType);
  }

  async update(
    id: string,
    update: UpdateQuery<ReminderType>
  ): Promise<ReminderType | null> {
    const doc = await this.reminderModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    return doc?.toObject() as unknown as ReminderType | null;
  }

  async delete(id: string): Promise<ReminderType | null> {
    const doc = await this.reminderModel.findByIdAndDelete(id);
    return doc?.toObject() as unknown as ReminderType | null;
  }
}

export const reminderRepository = new ReminderRepository(ReminderModel);
