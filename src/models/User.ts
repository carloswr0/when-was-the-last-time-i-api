import bcrypt from "bcrypt";
import mongoose, { type Model } from "mongoose";

import { applyApiSerialization } from "./mongoose-serialization.ts";

const SALT_ROUNDS = 10;

/** Mirrors schema constraints — use for API validation before persist. */
export const USER_NAME_MAX_LENGTH = 100;
export const USER_NAME_MIN_LENGTH = 4;
export const USER_PASSWORD_MIN_LENGTH = 8;
export const USER_PASSWORD_MAX_LENGTH = 128;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: [USER_NAME_MIN_LENGTH, `Name must be longer than ${USER_NAME_MIN_LENGTH} characters`],
      maxlength: [
        USER_NAME_MAX_LENGTH,
        `Name cannot exceed ${USER_NAME_MAX_LENGTH} characters`,
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [USER_PASSWORD_MIN_LENGTH, `Password must be at least ${USER_PASSWORD_MIN_LENGTH} characters`],
      maxLength: [USER_PASSWORD_MAX_LENGTH, `Password cannot exceed ${USER_PASSWORD_MAX_LENGTH} characters`],
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    /** Optional profile image URL. */
    avatarUrl: {
      type: String,
      default: null,
    },
    /** Set on successful login for auditing and “last seen” features. */
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

applyApiSerialization(userSchema, { omitFromJSON: ["password"] });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

export type UserType = mongoose.InferSchemaType<typeof userSchema>;

/** Single `Model` type — avoids a `??` union that breaks `findById` / `findOne` inference. */
export const UserModel = (mongoose.models.User ?? mongoose.model("User", userSchema)) as Model<UserType>;