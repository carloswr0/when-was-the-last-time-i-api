import type { UpdateQuery } from "mongoose";
import {
  UserRemindersGroupModel,
  type UserRemindersGroupType,
} from "../models/UserRemindersGroup.ts";

class UserRemindersGroupRepository {
  constructor(
    private readonly userRemindersGroupModel: typeof UserRemindersGroupModel
  ) {}

  async create(
    membership: Parameters<typeof UserRemindersGroupModel.create>[0]
  ): Promise<UserRemindersGroupType | null> {
    const doc = await this.userRemindersGroupModel.create(membership);
    return doc?.toObject() as unknown as UserRemindersGroupType | null;
  }

  async findById(id: string): Promise<UserRemindersGroupType | null> {
    const doc = await this.userRemindersGroupModel.findById(id);
    return doc?.toObject() as unknown as UserRemindersGroupType | null;
  }

  async getAll(): Promise<UserRemindersGroupType[]> {
    const docs = await this.userRemindersGroupModel.find();
    return docs.map((d) => d.toObject() as unknown as UserRemindersGroupType);
  }

  async update(
    id: string,
    update: UpdateQuery<UserRemindersGroupType>
  ): Promise<UserRemindersGroupType | null> {
    const doc = await this.userRemindersGroupModel.findByIdAndUpdate(
      id,
      update,
      {
        new: true,
        runValidators: true,
      }
    );
    return doc?.toObject() as unknown as UserRemindersGroupType | null;
  }

  async delete(id: string): Promise<UserRemindersGroupType | null> {
    const doc = await this.userRemindersGroupModel.findByIdAndDelete(id);
    return doc?.toObject() as unknown as UserRemindersGroupType | null;
  }
}

export const userRemindersGroupRepository = new UserRemindersGroupRepository(
  UserRemindersGroupModel
);
