import type { UpdateQuery } from "mongoose";
import { UserModel, type UserType } from "../models/User.ts";

class UserRepository {
  private readonly userModel: typeof UserModel;

  constructor(userModel: typeof UserModel) {
    this.userModel = userModel;
  }

  async create(
    user: Parameters<typeof UserModel.create>[0]
  ): Promise<UserType | null> {
    const newUser = await this.userModel.create(user);
    return newUser?.toObject() as unknown as UserType | null;
  }

  async findById(id: string): Promise<UserType | null> {
    const user = await this.userModel.findById(id);
    return user?.toObject() as unknown as UserType | null;
  }

  async findByEmail(email: string): Promise<UserType | null> {
    const user = await this.userModel.findOne({ email });
    return user?.toObject() as unknown as UserType | null;
  }

  /** Includes `password` for auth flows (`password` is `select: false` on the schema). */
  async findByEmailWithPassword(email: string): Promise<UserType | null> {
    const user = await this.userModel.findOne({ email }).select("+password");
    return user?.toObject() as unknown as UserType | null;
  }

  async getAll(): Promise<UserType[]> {
    const users = await this.userModel.find();
    return users.map((u) => u.toObject() as unknown as UserType);
  }

  async update(
    id: string,
    update: UpdateQuery<UserType>
  ): Promise<UserType | null> {
    const user = await this.userModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    return user?.toObject() as unknown as UserType | null;
  }

  async delete(id: string): Promise<UserType | null> {
    const user = await this.userModel.findByIdAndDelete(id);
    return user?.toObject() as unknown as UserType | null;
  }

  /** Minimal read to verify the users collection / DB responds. */
  async getOneUserToCheckDBHealth(): Promise<{ id: string } | null> {
    const doc = await this.userModel.findOne().select("_id").lean();
    if (!doc) return null;
    return { id: String(doc._id) };
  }
}

export const userRepository = new UserRepository(UserModel);
