import { ErrorCode } from "../constants/error-codes.ts";
import type { ApiErrorBody } from "../types/api-response.types.ts";

/** Object form: set `status` for non-500 client or server errors; `ok` is rarely needed (defaults to `false`). */
export type ServerErrorPayload = {
  message: string;
  status?: number;
  ok?: boolean;
};

export type ServerErrorInput = string | ServerErrorPayload;

function normalizeHttpStatus(status: number | undefined): number {
  if (status === undefined || !Number.isFinite(status)) {
    return 500;
  }
  const code = Math.trunc(status);
  if (code < 100 || code > 599) {
    return 500;
  }
  return code;
}

function httpStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCode.BAD_REQUEST;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 409:
      return ErrorCode.CONFLICT;
    case 429:
      return ErrorCode.TOO_MANY_REQUESTS;
    default:
      if (status >= 500) return ErrorCode.INTERNAL_SERVER_ERROR;
      if (status >= 400) return ErrorCode.BAD_REQUEST;
      return ErrorCode.INTERNAL_SERVER_ERROR;
  }
}

/** Maps a thrown {@link ServerError} to the API `error` object used by response helpers. */
export function apiErrorBodyFromServerError(error: ServerError): ApiErrorBody {
  return {
    code: httpStatusToErrorCode(error.status),
    details: [{ field: "general", message: error.message }],
  };
}

export function internalErrorBody(detailMessage: string): ApiErrorBody {
  return {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    details: [{ field: "general", message: detailMessage }],
  };
}

/** MongoDB duplicate key (e.g. unique index violation). */
export function isMongoDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11_000
  );
}

class ServerError extends Error {
  readonly status: number;
  readonly ok: boolean;

  constructor(errorData: ServerErrorInput) {
    const message =
      typeof errorData === "string" ? errorData : errorData.message;
    super(message);
    this.name = "ServerError";

    if (typeof errorData === "string") {
      this.status = 500;
      this.ok = false;
    } else {
      this.status = normalizeHttpStatus(errorData.status);
      this.ok = errorData.ok ?? false;
    }
  }
}

export { ServerError };
export default ServerError;
