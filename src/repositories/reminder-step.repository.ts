import type { UpdateQuery } from "mongoose";
import {
  ReminderStepModel,
  type ReminderStepType,
} from "../models/ReminderStep.ts";

class ReminderStepRepository {
  constructor(private readonly reminderStepModel: typeof ReminderStepModel) {}

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
}

export const reminderStepRepository = new ReminderStepRepository(
  ReminderStepModel
);
