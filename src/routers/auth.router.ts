import express from "express";
import AuthController from "../controllers/auth.controller.ts";

const authRouter = express.Router();

const authController = new AuthController();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("/request-password-reset", authController.resetPasswordRequest);
authRouter.post("/reset-password", authController.resetPassword);

export default authRouter;
