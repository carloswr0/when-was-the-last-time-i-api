import type { Request, Response } from "express";
import { userRepository } from "../repositories/user.repository.js";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

class HealthController {
  getApiHealth(_req: Request, res: Response): void {
    res.status(200).json({
      message: "API is healthy",
      status: 200,
      ok: true,
    });
  }

  async getDbHealth(_req: Request, res: Response): Promise<void> {
    try {
      const user = await userRepository.getOneUserToCheckDBHealth();
      res.status(200).json({
        message: "Database is healthy",
        status: 200,
        ok: true,
        user: user,
      });
    } catch (error: unknown) {
      res.status(500).json({
        message: "Database is not healthy",
        status: 500,
        ok: false,
        error: errorMessage(error),
      });
    }
  }
}

export default HealthController;
