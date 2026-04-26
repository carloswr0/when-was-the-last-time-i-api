import express from "express";
import UserController from "../controllers/user.controller.ts";

const userRouter = express.Router();
const userController = new UserController();

userRouter.get("/:user_id/get-all-reminders", userController.getAllUserReminders);

export default userRouter;
