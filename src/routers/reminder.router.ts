import express from "express";
import reminderController from "../controllers/reminder.controller.ts";
import verifyRolePermissionAndBelonging from "../middlewares/verifyRolePermissionAndBelonging.middleware.ts";

const reminderRouter = express.Router({ mergeParams: true });

reminderRouter.post("/", verifyRolePermissionAndBelonging((['owner', 'admin', 'member'])), reminderController.createReminder.bind(reminderController));
reminderRouter.get(
  "/", verifyRolePermissionAndBelonging((['owner', 'admin', 'member', 'invited'])),
  reminderController.getRemindersByGroupId.bind(reminderController),
);
reminderRouter.post(
  "/:reminder_id/complete", verifyRolePermissionAndBelonging((['owner', 'admin', 'member'])),
  reminderController.completeReminder.bind(reminderController),
);
reminderRouter.get(
  "/:reminder_id", verifyRolePermissionAndBelonging((['owner', 'admin', 'member', 'invited'])),
  reminderController.getById.bind(reminderController),
);
reminderRouter.patch(
  "/:reminder_id", verifyRolePermissionAndBelonging((['owner', 'admin', 'member'])),
  reminderController.updateReminder.bind(reminderController),
);
reminderRouter.delete(
  "/:reminder_id", verifyRolePermissionAndBelonging((['owner', 'admin'])),
  reminderController.deleteReminder.bind(reminderController),
);

export default reminderRouter;
