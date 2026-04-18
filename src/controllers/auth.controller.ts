import type { Request, Response } from "express";
import ServerError from "../helpers/error.helper.ts";
import authService, {
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type ResetPasswordRequestInput,
  type VerifyEmailInput,
} from "../services/auth.service.ts";

function serverErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal server error";
}

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body as RegisterInput;
      await authService.register({ name, email, password });
      res.status(201).json({
        message:
          "User registered successfully. Please check your email to verify your account.",
        status: 201,
        ok: true,
      });
    } catch (error: unknown) {
      if (error instanceof ServerError) {
        res.status(error.status).json({
          message: error.message,
          status: error.status,
          ok: false,
        });
        return;
      }
      res.status(500).json({
        message: "Internal server error",
        status: 500,
        ok: false,
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginInput;
      const auth_token = await authService.login({ email, password });

      res.status(200).json({
        message: "Login successful",
        status: 200,
        ok: true,
        data: {
          auth_token,
        },
      });
    } catch (error: unknown) {
      if (error instanceof ServerError) {
        res.status(error.status).json({
          message: error.message,
          status: error.status,
          ok: false,
        });
        return;
      }
      res.status(500).json({
        message: serverErrorMessage(error),
        status: 500,
        ok: false,
      });
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { verify_email_token } = req.query as Pick<
        VerifyEmailInput,
        "verify_email_token"
      >;
      await authService.verifyEmail(
        verify_email_token === undefined
          ? {}
          : { verify_email_token },
      );

      res.status(200).json({
        message: "Email verified successfully",
        status: 200,
        ok: true,
      });
    } catch (error: unknown) {
      if (error instanceof ServerError) {
        res.status(error.status).json({
          message: error.message,
          status: error.status,
          ok: false,
        });
        return;
      }
      res.status(500).json({
        message: serverErrorMessage(error),
        status: 500,
        ok: false,
      });
    }
  }

  async resetPasswordRequest(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body as ResetPasswordRequestInput;
      await authService.resetPasswordRequest({ email });
      res.status(200).json({
        ok: true,
        status: 200,
        message:
          "A mail has been sent to your email address with instructions to reset your password",
      });
    } catch (error: unknown) {
      if (error instanceof ServerError) {
        res.status(error.status).json({
          ok: false,
          status: error.status,
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        ok: false,
        status: 500,
        message: "Error requesting password reset",
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { reset_password_token } = req.query as Pick<
        ResetPasswordInput,
        "reset_password_token"
      >;
      const { password } = req.body as Pick<ResetPasswordInput, "password">;

      await authService.resetPassword({ reset_password_token, password });
      res.status(200).json({
        ok: true,
        status: 200,
        message: "Password reset successfully ",
      });
    } catch (error: unknown) {
      if (error instanceof ServerError) {
        res.status(error.status).json({
          ok: false,
          status: error.status,
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        ok: false,
        status: 500,
        message: "Error resetting password",
      });
    }
  }
}

export default AuthController;
