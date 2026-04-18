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
