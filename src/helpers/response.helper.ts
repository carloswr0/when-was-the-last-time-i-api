import type { Response } from "express";
import { ErrorCode } from "../constants/error-codes.ts";
import type {
  ApiErrorBody,
  FieldErrorDetail,
  StandardApiResponse,
} from "../types/api-response.types.ts";

function buildErrorBody(
  code: ErrorCode,
  details: FieldErrorDetail[] = [],
): ApiErrorBody {
  return { code, details };
}

function buildSuccessResponse<T>(
  data: T | null,
  message?: string | null,
  meta?: Record<string, unknown>,
): StandardApiResponse<T> {
  return {
    success: true,
    message: message ?? null,
    data,
    error: null,
    meta: meta ?? {},
  };
}

function buildErrorResponse(
  error: ApiErrorBody,
  message?: string | null,
  meta?: Record<string, unknown>,
): StandardApiResponse<null> {
  return {
    success: false,
    message: message ?? null,
    data: null,
    error,
    meta: meta ?? {},
  };
}

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  data?: T | null,
  message?: string | null,
  meta?: Record<string, unknown>
): void {
  res.status(statusCode).json(buildSuccessResponse(data, message, meta));
}

export function sendError(
  res: Response,
  statusCode: number,
  error: ApiErrorBody,
  message?: string | null,
  meta?: Record<string, unknown>,
): void {
  res.status(statusCode).json(buildErrorResponse(error, message, meta));
}