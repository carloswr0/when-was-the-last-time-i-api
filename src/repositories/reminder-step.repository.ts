import type { UpdateQuery } from "mongoose";
import {
  ReminderStepModel,
  type ReminderStepType,
} from "../models/ReminderStep.ts";

class ReminderStepRepository {
  private readonly reminderStepModel: typeof ReminderStepModel;

  constructor(reminderStepModel: typeof ReminderStepModel) {
    this.reminderStepModel = reminderStepModel;
  }

  async create(
    step: Parameters<typeof ReminderStepModel.create>[0]
  ): Promise<ReminderStepType | null> {
    const doc = await this.reminderStepModel.create(step);
    return doc?.toObject() as unknown as ReminderStepType | null;
  }

  async findById(id: string): Promise<ReminderStepType | null> {
    const doc = await this.reminderStepModel.findById(id);
    return doc?.toObject() as unknown as ReminderStepType | null;
  }

  async getAll(): Promise<ReminderStepType[]> {
    const docs = await this.reminderStepModel.find();
    return docs.map((d) => d.toObject() as unknown as ReminderStepType);
  }

  async update(
    id: string,
    update: UpdateQuery<ReminderStepType>
  ): Promise<ReminderStepType | null> {
    const doc = await this.reminderStepModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    return doc?.toObject() as unknown as ReminderStepType | null;
  }

  async delete(id: string): Promise<ReminderStepType | null> {
    const doc = await this.reminderStepModel.findByIdAndDelete(id);
    return doc?.toObject() as unknown as ReminderStepType | null;
  }

  async deleteManyByReminderIds(reminderIds: string[]): Promise<number> {
    if (reminderIds.length === 0) {
      return 0;
    }
    const result = await this.reminderStepModel.deleteMany({
      reminder: { $in: reminderIds },
    });
    return result.deletedCount ?? 0;
  }
}

export const reminderStepRepository = new ReminderStepRepository(
  ReminderStepModel
);
