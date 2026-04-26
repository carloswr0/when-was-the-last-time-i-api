import mongoose, { type Model } from "mongoose";

import { applyApiSerialization } from "./mongoose-serialization.ts";

const reminderStepHistorySchema = new mongoose.Schema(
  {
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "lastUpdatedBy is required"],
    },
    lastUpdatedAt: {
      type: Date,
      required: [true, "lastUpdatedAt is required"],
      default: Date.now,
    },
    remindersGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RemindersGroup",
      required: [true, "Reminders group is required"],
    },
    parentReminder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reminder",
      required: [true, "parentReminder is required"],
    }
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

reminderStepHistorySchema.index({ remindersGroup: 1, lastUpdatedAt: -1 });

applyApiSerialization(reminderStepHistorySchema);

export type ReminderStepHistoryType = mongoose.InferSchemaType<
  typeof reminderStepHistorySchema
>;

export const ReminderStepHistoryModel = (mongoose.models.ReminderHistory ??
  mongoose.model("ReminderStepHistory", reminderStepHistorySchema)) as Model<ReminderStepHistoryType>;
