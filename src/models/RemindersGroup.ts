import mongoose from "mongoose";

export const remindersGroupTypes = ["personal", "shared"] as const;

const remindersGroupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: {
        values: remindersGroupTypes,
        message: "{VALUE} is not a valid reminders group type",
      },
    },
  },
  {
    timestamps: true,
  }
);

export const RemindersGroupModel =
  mongoose.models.RemindersGroup ??
  mongoose.model("RemindersGroup", remindersGroupSchema);
