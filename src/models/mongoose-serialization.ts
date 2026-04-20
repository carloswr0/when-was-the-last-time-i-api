import type { Schema } from "mongoose";

export type ApplyApiSerializationOptions = {
  /**
   * Removed from `toJSON` only (e.g. `password` on User).
   * `toObject` keeps them for internal flows (e.g. bcrypt).
   */
  omitFromJSON?: string[];
};

function normalizeDoc(ret: Record<string, unknown>): void {
  if (ret._id != null) {
    ret.id = ret._id;
    delete ret._id;
  }
  delete ret.__v;
}

export function applyApiSerialization(
  schema: Schema,
  options?: ApplyApiSerializationOptions,
): void {
  const omitFromJSON = new Set(options?.omitFromJSON ?? []);

  schema.set("toJSON", {
    virtuals: true,
    transform(_doc, ret) {
      const r = ret as Record<string, unknown>;
      normalizeDoc(r);
      for (const key of omitFromJSON) {
        delete r[key];
      }
      return r;
    },
  });

  schema.set("toObject", {
    virtuals: true,
    transform(_doc, ret) {
      const r = ret as Record<string, unknown>;
      normalizeDoc(r);
      return r;
    },
  });
}
