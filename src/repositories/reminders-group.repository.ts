import type { UpdateQuery } from "mongoose";
import {
  RemindersGroupModel,
  type RemindersGroupType,
} from "../models/RemindersGroup.ts";

class RemindersGroupRepository {
  private readonly remindersGroupModel: typeof RemindersGroupModel;

  constructor(remindersGroupModel: typeof RemindersGroupModel) {
    this.remindersGroupModel = remindersGroupModel;
  }

  async create(
    group: Parameters<typeof RemindersGroupModel.create>[0]
  ): Promise<RemindersGroupType | null> {
    const doc = await this.remindersGroupModel.create(group);
    return doc?.toObject() as unknown as RemindersGroupType | null;
  }

  async findById(id: string): Promise<RemindersGroupType | null> {
    const doc = await this.remindersGroupModel.findById(id);
    return doc?.toObject() as unknown as RemindersGroupType | null;
  }

  async getAll(): Promise<RemindersGroupType[]> {
    const docs = await this.remindersGroupModel.find();
    return docs.map((d) => d.toObject() as unknown as RemindersGroupType);
  }

  async update(
    id: string,
    update: UpdateQuery<RemindersGroupType>
  ): Promise<RemindersGroupType | null> {
    const doc = await this.remindersGroupModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    return doc?.toObject() as unknown as RemindersGroupType | null;
  }

  async delete(id: string): Promise<RemindersGroupType | null> {
    const doc = await this.remindersGroupModel.findByIdAndDelete(id);
    return doc?.toObject() as unknown as RemindersGroupType | null;
  }
}

export const remindersGroupRepository = new RemindersGroupRepository(
  RemindersGroupModel
);
