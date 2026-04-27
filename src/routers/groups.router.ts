import express from "express";
import GroupsController from "../controllers/groups.controller.ts";
import reminderRouter from "./reminder.router.ts";
import verifyRolePermissionAndBelonging from "../middlewares/verifyRolePermissionAndBelonging.middleware.ts";

const groupsRouter = express.Router();
const groupsController = new GroupsController();

groupsRouter.post("/", groupsController.createGroup);
groupsRouter.get("/get-user-groups", groupsController.getGroup);
groupsRouter.get("/:group_id", verifyRolePermissionAndBelonging([]), groupsController.getGroupDetails);
groupsRouter.use("/:group_id/reminder", verifyRolePermissionAndBelonging([]), reminderRouter);

export default groupsRouter;
