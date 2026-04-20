import mongoose, { type Model } from "mongoose";

import { remindersGroupTypes } from "../constants/index.ts";
import { applyApiSerialization } from "./mongoose-serialization.ts";

const remindersGroupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: [500, "Title cannot exceed 500 characters"],
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
    versionKey: false,
  }
);

applyApiSerialization(remindersGroupSchema);

export type RemindersGroupType = mongoose.InferSchemaType<
  typeof remindersGroupSchema
>;

export const RemindersGroupModel = (mongoose.models.RemindersGroup ?? mongoose.model("RemindersGroup", remindersGroupSchema)) as Model<RemindersGroupType>;
