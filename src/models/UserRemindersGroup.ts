import mongoose from "mongoose";

export const userRemindersGroupRoles = ["owner", "member", "viewer"] as const;

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
        message: "{VALUE} is not a valid role",
      },
    },
  },
  {
    timestamps: true,
  }
);

userRemindersGroupSchema.index({ user: 1, remindersGroup: 1 }, { unique: true });

export const UserRemindersGroupModel =
  mongoose.models.UserRemindersGroup ??
  mongoose.model("UserRemindersGroup", userRemindersGroupSchema);
