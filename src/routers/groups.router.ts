import express from "express";
import RemindersGroupController from "../controllers/groups.controller.ts";
//import authMiddleware from "../middlewares/authMiddleware.js";
//import channelRouter from "./channel.router.ts";
//import verifyWorkspaceMembershipAndPermissions from "../middlewares/verifyWorkspaceMembershipAndPermissions.middleware.js";

const workspaceRouter = express.Router();
const workspaceController = new RemindersGroupController();

//workspaceRouter.use(authMiddleware);

workspaceRouter.post("/", workspaceController.createGroup);
workspaceRouter.get("/get-user-workspaces", workspaceController.getGroup);
//workspaceRouter.get("/:workspace_id", verifyWorkspaceMembershipAndPermissions([]), workspaceController.getWorkspaceDetails);
//workspaceRouter.use("/:workspace_id/channel", channelRouter);

export default workspaceRouter;
