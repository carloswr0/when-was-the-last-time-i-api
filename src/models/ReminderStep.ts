import mongoose, { type Model } from "mongoose";

import { reminderTypes } from "../constants/index.ts";

const reminderStepSchema = new mongoose.Schema(
  {
    reminder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reminder",
      required: [true, "Reminder is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    icon: {
      type: String,
      trim: true,
      default: null,
    },
    bannerImage: {
      type: String,
      trim: true,
      default: null,
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: {
        values: reminderTypes,
        message: "{VALUE} is not a valid reminderstep type",
      },
    },
    lastTimeSomeoneDidThis: {
      type: Date,
      default: null,
    },
    lastPersonWhoDidThis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserRemindersGroup",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export type ReminderStepType = mongoose.InferSchemaType<
  typeof reminderStepSchema
>;

export const ReminderStepModel = (mongoose.models.ReminderStep ??
  mongoose.model("ReminderStep", reminderStepSchema)) as Model<ReminderStepType>;
