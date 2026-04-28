import type { UpdateQuery } from "mongoose";
import { isMongoDuplicateKeyError } from "../helpers/error.helper.ts";
import {
  UserRemindersGroupModel,
  type UserRemindersGroupType,
} from "../models/UserRemindersGroup.ts";

class UserRemindersGroupRepository {
  private readonly userRemindersGroupModel: typeof UserRemindersGroupModel;

  constructor(userRemindersGroupModel: typeof UserRemindersGroupModel) {
    this.userRemindersGroupModel = userRemindersGroupModel;
  }

  async create(
    membership: Parameters<typeof UserRemindersGroupModel.create>[0]
  ): Promise<UserRemindersGroupType | null> {
    const doc = await this.userRemindersGroupModel.create(membership);
    return doc?.toObject() as unknown as UserRemindersGroupType | null;
  }

  /**
   * Adds membership for (user, remindersGroup) only if absent — one invite per pair, race-safe.
   */
  async createMemberIfAbsent(params: {
    userId: string;
    remindersGroupId: string;
    role: UserRemindersGroupType["role"];
  }): Promise<{ inserted: boolean; doc: UserRemindersGroupType }> {
    const { userId, remindersGroupId, role } = params;
    try {
      const result = await this.userRemindersGroupModel.updateOne(
        { user: userId, remindersGroup: remindersGroupId },
        {
          $setOnInsert: {
            user: userId,
            remindersGroup: remindersGroupId,
            role,
          },
        },
        { upsert: true }
      );
      if (result.upsertedCount === 0) {
        const doc = await this.findByUserAndRemindersGroupId(
          userId,
          remindersGroupId
        );
        if (!doc) {
          throw new Error("Expected membership after updateOne matched");
        }
        return { inserted: false, doc };
      }
      const insertedId = result.upsertedId;
      const doc = insertedId
        ? await this.findById(String(insertedId))
        : await this.findByUserAndRemindersGroupId(userId, remindersGroupId);
      if (!doc) {
        throw new Error("Expected membership after upsert insert");
      }
      return { inserted: true, doc };
    } catch (err: unknown) {
      if (isMongoDuplicateKeyError(err)) {
        const doc = await this.findByUserAndRemindersGroupId(
          userId,
          remindersGroupId
        );
        if (doc) return { inserted: false, doc };
      }
      throw err;
    }
  }

  async findById(id: string): Promise<UserRemindersGroupType | null> {
    const doc = await this.userRemindersGroupModel.findById(id);
    return doc?.toObject() as unknown as UserRemindersGroupType | null;
  }

  async findByUserAndRemindersGroupId(
    userId: string,
    remindersGroupId: string,
  ): Promise<UserRemindersGroupType | null> {
    const doc = await this.userRemindersGroupModel.findOne({
      user: userId,
      remindersGroup: remindersGroupId,
    });
    return doc?.toObject() as unknown as UserRemindersGroupType | null;
  }

  /** Membership rows for a user (excluding `invited`), with `remindersGroup` populated. */
  async findByUserId(userId: string): Promise<UserRemindersGroupType[]> {
    const docs = await this.userRemindersGroupModel
      .find({ user: userId, role: { $ne: "invited" } })
      .populate("remindersGroup");
    return docs.map((d) => d.toObject() as unknown as UserRemindersGroupType);
  }

  /** Pending invitations: membership rows for a user with role `invited`, `remindersGroup` populated. */
  async findInvitedByUserId(userId: string): Promise<UserRemindersGroupType[]> {
    const docs = await this.userRemindersGroupModel
      .find({ user: userId, role: "invited" })
      .populate("remindersGroup");
    return docs.map((d) => d.toObject() as unknown as UserRemindersGroupType);
  }

  /** Membership rows for a reminders group, with `user` populated. */
  async findByRemindersGroupId(
    remindersGroupId: string
  ): Promise<UserRemindersGroupType[]> {
    const docs = await this.userRemindersGroupModel
      .find({ remindersGroup: remindersGroupId })
      .populate("user");
    return docs.map((d) => d.toObject() as unknown as UserRemindersGroupType);
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
