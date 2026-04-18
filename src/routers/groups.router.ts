import express from "express";
import GroupsController from "../controllers/groups.controller.ts";
import authMiddleware from "../middlewares/auth.middleware.ts";
import reminderRouter from "./reminder.router.ts";
import verifyRolePermissionAndBelonging from "../middlewares/verifyRolePermissionAndBelonging.middleware.ts";

const groupsRouter = express.Router();
const groupsController = new GroupsController();

groupsRouter.use(authMiddleware);
groupsRouter.post("/", groupsController.createGroup);
groupsRouter.get("/get-user-workspaces", groupsController.getGroup);
groupsRouter.get("/:workspace_id", verifyRolePermissionAndBelonging([]), groupsController.getGroupDetails);
groupsRouter.use("/:workspace_id/channel", reminderRouter);

export default groupsRouter;
