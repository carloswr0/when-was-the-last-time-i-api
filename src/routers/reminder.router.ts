import express from "express";
import reminderController from "../controllers/reminder.controller.ts";

const reminderRouter = express.Router({ mergeParams: true });

reminderRouter.post("/", reminderController.createReminder.bind(reminderController));
reminderRouter.get(
  "/",
  reminderController.getRemindersByGroupId.bind(reminderController),
);
reminderRouter.get(
  "/:reminder_id",
  reminderController.getById.bind(reminderController),
);
reminderRouter.patch(
  "/:reminder_id",
  reminderController.updateReminder.bind(reminderController),
);
reminderRouter.delete(
  "/:reminder_id",
  reminderController.deleteReminder.bind(reminderController),
);

export default reminderRouter;
