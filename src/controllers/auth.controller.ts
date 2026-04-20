import type { Request, Response } from "express";
import ServerError, {
  apiErrorBodyFromServerError,
  internalErrorBody,
} from "../helpers/error.helper.ts";
import { sendError, sendSuccess } from "../helpers/response.helper.ts";
import { serverErrorMessage } from "../helpers/serverErrorMessage.helper.ts";
import authService, {
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type ResetPasswordRequestInput,
  type VerifyEmailInput,
} from "../services/auth.service.ts";

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body as RegisterInput;
      await authService.register({ name, email, password });
      sendSuccess(res, 201, null, "User registered successfully. Please check your email to verify your account.");
    } catch (error: unknown) {
      if (error instanceof ServerError) {
        sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
        return;
      }
      sendError(res, 500, internalErrorBody("Internal server error"), "Internal server error");
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginInput;
      const auth_token = await authService.login({ email, password });

      sendSuccess(res, 200, { auth_token }, "Login successful");
    } catch (error: unknown) {
      if (error instanceof ServerError) {
        sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
        return;
      }
      sendError(res, 500, internalErrorBody(serverErrorMessage(error)), serverErrorMessage(error));
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

      sendSuccess(res, 200, null, "Email verified successfully");
    } catch (error: unknown) {
      if (error instanceof ServerError) {
        sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
        return;
      }
      sendError(res, 500, internalErrorBody(serverErrorMessage(error)), serverErrorMessage(error));
    }
  }

  async resetPasswordRequest(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body as ResetPasswordRequestInput;
      await authService.resetPasswordRequest({ email });
      sendSuccess(
        res,
        200,
        null,
        "A mail has been sent to your email address with instructions to reset your password",
      );
    } catch (error: unknown) {
      if (error instanceof ServerError) {
        sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
        return;
      }
      sendError(res, 500, internalErrorBody("Error requesting password reset"), "Error requesting password reset");
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
      sendSuccess(res, 200, null, "Password reset successfully ");
    } catch (error: unknown) {
      if (error instanceof ServerError) {
        sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
        return;
      }
      sendError(res, 500, internalErrorBody("Error resetting password"), "Error resetting password");
    }
  }
}

export default AuthController;
