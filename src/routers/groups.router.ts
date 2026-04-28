import express from "express";
import GroupsController from "../controllers/groups.controller.ts";
import reminderRouter from "./reminder.router.ts";
import verifyRolePermissionAndBelonging from "../middlewares/verifyRolePermissionAndBelonging.middleware.ts";

const groupsRouter = express.Router();
const groupsController = new GroupsController();

groupsRouter.post("/", groupsController.createGroup);
groupsRouter.post("/:group_id/invite", verifyRolePermissionAndBelonging(['owner', 'admin']), groupsController.inviteToGroup);
groupsRouter.post("/:group_id/accept-invitation", verifyRolePermissionAndBelonging(['invited']), groupsController.acceptInvitation);
groupsRouter.put("/:group_id", verifyRolePermissionAndBelonging(['owner', 'admin']), groupsController.editGroup);
groupsRouter.delete("/:group_id", verifyRolePermissionAndBelonging(['owner']), groupsController.deleteGroup);
groupsRouter.get("/get-user-groups", groupsController.getGroup);
groupsRouter.get("/invited", groupsController.getInvitedGroups);
groupsRouter.get("/:group_id", verifyRolePermissionAndBelonging([]), groupsController.getGroupDetails);
groupsRouter.use("/:group_id/reminder", reminderRouter);

export default groupsRouter;
