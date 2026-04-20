import mongoose, { type Model } from "mongoose";

import { reminderTypes } from "../constants/index.ts";
import { applyApiSerialization } from "./mongoose-serialization.ts";

const reminderSchema = new mongoose.Schema(
  {
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
        message: "{VALUE} is not a valid reminder type",
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
    frequency: {
      type: Number,
      required: [true, "Frequency is required"],
    },
    pushNotificationsEnabled: {
      type: Boolean,
      required: true,
      default: false,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

applyApiSerialization(reminderSchema);

export type ReminderType = mongoose.InferSchemaType<typeof reminderSchema>;

export const ReminderModel = (mongoose.models.Reminder ?? mongoose.model("Reminder", reminderSchema)) as Model<ReminderType>;
