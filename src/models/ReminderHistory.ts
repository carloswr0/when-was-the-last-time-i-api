import mongoose, { type Model } from "mongoose";

import { applyApiSerialization } from "./mongoose-serialization.ts";

const reminderHistorySchema = new mongoose.Schema(
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
    reminder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reminder",
      required: [true, "Reminder is required"],
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

reminderHistorySchema.index({ remindersGroup: 1, lastUpdatedAt: -1 });

applyApiSerialization(reminderHistorySchema);

export type ReminderHistoryType = mongoose.InferSchemaType<
  typeof reminderHistorySchema
>;

export const ReminderHistoryModel = (mongoose.models.ReminderHistory ??
  mongoose.model("ReminderHistory", reminderHistorySchema)) as Model<ReminderHistoryType>;
