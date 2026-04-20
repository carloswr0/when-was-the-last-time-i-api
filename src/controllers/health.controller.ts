import type { Request, Response } from "express";
import { ErrorCode } from "../constants/error-codes.ts";
import { sendError, sendSuccess } from "../helpers/response.helper.ts";
import { userRepository } from "../repositories/user.repository.ts";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

class HealthController {
  getApiHealth(_req: Request, res: Response): void {
    sendSuccess(res, 200, null, "API is healthy.");
  }

  async getDbHealth(_req: Request, res: Response): Promise<void> {
    try {
      const user = await userRepository.getOneUserToCheckDBHealth();
      sendSuccess(
        res,
        200,
        null,
        "Database is healthy.",
      );
    } catch (error: unknown) {
      const errText = errorMessage(error);
      sendError(
        res,
        500,
        {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          details: [{ field: "database", message: errText }],
        },
        "Database is not healthy.",
        { error: errText },
      );
    }
  }
}

export default HealthController;
