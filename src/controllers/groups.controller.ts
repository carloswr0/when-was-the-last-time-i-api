import type { Request, Response } from "express";
import { remindersGroupTypes } from "../constants/index.ts";
import ServerError from "../helpers/error.helper.ts";
import { serverErrorMessage } from "../helpers/serverErrorMessage.helper.ts";
import { remindersGroupRepository } from "../repositories/reminders-group.repository.ts";
import { userRemindersGroupRepository } from "../repositories/user-reminders-group.repository.ts";

function isRemindersGroupType(
  value: unknown
): value is (typeof remindersGroupTypes)[number] {
  return (
    typeof value === "string" &&
    (remindersGroupTypes as readonly string[]).includes(value)
  );
}

/** Resolves authenticated user id from JWT/session payloads (Mongoose doc or plain object). */
function getAuthUserId(req: Request): string | undefined {
  const raw = (req as Request & { user?: unknown }).user as
    | { id?: string; _id?: unknown; _doc?: { id?: string; _id?: unknown } }
    | undefined;
  if (!raw) return undefined;
  const u = raw._doc ?? raw;
  if (typeof u.id === "string") return u.id;
  if (u._id != null) return String(u._id);
  return undefined;
}

class GroupsController {
  async createGroup(req: Request, res: Response): Promise<void> {
    try {
      const { title, type } = req.body as { title?: unknown; type?: unknown };
      const userId = getAuthUserId(req);

      if (!userId) {
        res.status(401).json({
          message: "Unauthorized: user not authenticated",
          status: 401,
          ok: false,
        });
        return;
      }

      if (typeof title !== "string" || !title.trim()) {
        res.status(400).json({
          message: "Title is required",
          status: 400,
          ok: false,
        });
        return;
      }

      if (!isRemindersGroupType(type)) {
        res.status(400).json({
          message: `type must be one of: ${remindersGroupTypes.join(", ")}`,
          status: 400,
          ok: false,
        });
        return;
      }

      const createdGroup = await remindersGroupRepository.create({
        title: title.trim(),
        type,
      });

      if (!createdGroup) {
        res.status(500).json({
          message: "Failed to create reminders group",
          status: 500,
          ok: false,
        });
        return;
      }

      const created = createdGroup as typeof createdGroup & {
        _id?: unknown;
        id?: string;
      };
      const groupId =
        created.id != null
          ? String(created.id)
          : created._id != null
            ? String(created._id)
            : "";
      if (!groupId) {
        res.status(500).json({
          message: "Created group has no id",
          status: 500,
          ok: false,
        });
        return;
      }

      await userRemindersGroupRepository.create({
        user: userId,
        remindersGroup: groupId,
        role: "owner",
      });

      res.status(201).json({
        message: "success",
        status: 201,
        ok: true,
        data: createdGroup,
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

  async getGroup(req: Request, res: Response): Promise<void> {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        res.status(401).json({
          message: "Unauthorized: user not authenticated",
          status: 401,
          ok: false,
        });
        return;
      }

      const workspaces =
        await userRemindersGroupRepository.findByUserId(userId);
      res.status(200).json({
        ok: true,
        status: 200,
        message: "success",
        data: workspaces,
      });
    } catch (error: unknown) {
      res.status(500).json({
        message: serverErrorMessage(error),
        status: 500,
        ok: false,
      });
    }
  }

  async getGroupDetails(req: Request, res: Response): Promise<void> {
    try {
      const { workspace_id: workspaceId } = req.params as {
        workspace_id: string;
      };

      const workspaceMembers =
        await userRemindersGroupRepository.findByRemindersGroupId(workspaceId);

      const workspaceDetails =
        await remindersGroupRepository.findById(workspaceId);

      if (!workspaceDetails) {
        res.status(404).json({
          message: "Workspace not found",
          status: 404,
          ok: false,
        });
        return;
      }

      res.status(200).json({
        ok: true,
        status: 200,
        message: "success",
        data: { workspaceDetails, workspaceMembers },
      });
    } catch (error: unknown) {
      res.status(500).json({
        message: serverErrorMessage(error),
        status: 500,
        ok: false,
      });
    }
  }
}

export default GroupsController;
