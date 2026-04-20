import mongoose, { type Model } from "mongoose";

import { userRemindersGroupRoles } from "../constants/index.ts";
import { applyApiSerialization } from "./mongoose-serialization.ts";

const userRemindersGroupSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    remindersGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RemindersGroup",
      required: [true, "Reminders group is required"],
      index: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: userRemindersGroupRoles,
        message: "{VALUE} is not a valid user reminders group role",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

applyApiSerialization(userRemindersGroupSchema);

userRemindersGroupSchema.index({ user: 1, remindersGroup: 1 }, { unique: true });

export type UserRemindersGroupType = mongoose.InferSchemaType<
  typeof userRemindersGroupSchema
>;

export const UserRemindersGroupModel = (mongoose.models.UserRemindersGroup ??
  mongoose.model(
    "UserRemindersGroup",
    userRemindersGroupSchema
  )) as Model<UserRemindersGroupType>;
