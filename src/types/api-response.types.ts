import type { ErrorCode } from "../constants/error-codes.ts";

// ALL OF THESE MUST MATCH UI TYPES, IF YOU CHANGE ANYTHING FROM HERE, CHANGE IT IN THE UI AS WELL.

export type FieldErrorDetail = {
  field: string;
  message: string;
};

export type ApiErrorBody = {
  code: ErrorCode;
  details: FieldErrorDetail[];
};

/**
 * Standard envelope for all JSON API responses.
 * Success: `success: true`, `error: null`.
 * Failure: `success: false`, `data` typically `null`.
 */
export type StandardApiResponse<T = unknown> = {
  success: boolean;
  message: string | null;
  data: T | null;
  error: ApiErrorBody | null;
  meta: Record<string, unknown>;
};

// ALL OF THESE MUST MATCH UI TYPES, IF YOU CHANGE ANYTHING FROM HERE, CHANGE IT IN THE UI AS WELL.