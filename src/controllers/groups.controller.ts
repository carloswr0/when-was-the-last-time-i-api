import type { Request, Response } from "express";
import ENVIRONTMENT from "../config/environment.config.ts";
import mailerTransporter from "../config/mailer.config.ts";
import { ErrorCode } from "../constants/error-codes.ts";
import { remindersGroupTypes } from "../constants/index.ts";
import { getAuthUserId } from "../helpers/authUser.helper.ts";
import ServerError, {
  apiErrorBodyFromServerError,
  internalErrorBody,
} from "../helpers/error.helper.ts";
import { sendError, sendSuccess } from "../helpers/response.helper.ts";
import { serverErrorMessage } from "../helpers/serverErrorMessage.helper.ts";
import type { UserType } from "../models/User.ts";
import { remindersGroupRepository } from "../repositories/reminders-group.repository.ts";
import { userRemindersGroupRepository } from "../repositories/user-reminders-group.repository.ts";
import { userRepository } from "../repositories/user.repository.ts";

function plainUserId(user: UserType): string | null {
  const u = user as UserType & { id?: unknown; _id?: unknown };
  if (u.id != null) return String(u.id);
  if (u._id != null) return String(u._id);
  return null;
}

function isRemindersGroupType(
  value: unknown
): value is (typeof remindersGroupTypes)[number] {
  return (
    typeof value === "string" &&
    (remindersGroupTypes as readonly string[]).includes(value)
  );
}

class GroupsController {
  async createGroup(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, type } = req.body;
      const userId = getAuthUserId(req);

      if (!userId) {
        const msg = "Unauthorized: user not authenticated";
        sendError(res, 401, {
          code: ErrorCode.UNAUTHORIZED,
          details: [{ field: "authorization", message: msg }],
        }, msg);
        return;
      }

      if (typeof title !== "string" || !title.trim()) {
        const msg = "Title is required";
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "title", message: msg }],
        }, msg);
        return;
      }

      if (!isRemindersGroupType(type)) {
        const msg = `type must be one of: ${remindersGroupTypes.join(", ")}`;
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "type", message: msg }],
        }, msg);
        return;
      }

      const createdGroup = await remindersGroupRepository.create({
        title: title.trim(),
        type,
        ...(description !== undefined ? { description } : {}),
      });

      if (!createdGroup) {
        const msg = "Failed to create reminders group"
        sendError(res, 500, internalErrorBody(msg), msg);
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
        const msg = "Created group has no id"
        sendError(res, 500, internalErrorBody(msg), msg);
        return;
      }

      await userRemindersGroupRepository.create({
        user: userId,
        remindersGroup: groupId,
        role: "owner",
      });

      sendSuccess(res, 201, createdGroup, "success");
    } catch (error: unknown) {
      if (error instanceof ServerError) {
        sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
        return;
      }
      const msg = "Internal server error"
      sendError(res, 500, internalErrorBody(msg), msg);
    }
  }

  async editGroup(req: Request, res: Response): Promise<void> {
    try {
      const { group_id } = req.params as {
        group_id: string;
      };
      const { title, description, type } = req.body as {
        title: string;
        type: string;
        description?: string;
      };
      const userId = getAuthUserId(req);

      if (!userId) {
        const msg = "Unauthorized: user not authenticated";
        sendError(res, 401, {
          code: ErrorCode.UNAUTHORIZED,
          details: [{ field: "authorization", message: msg }],
        }, msg);
        return;
      }

      if (typeof group_id !== "string" || !group_id.trim()) {
        const msg = "group_id is required";
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "group_id", message: msg }],
        }, msg);
        return;
      }

      if (typeof title !== "string" || !title.trim()) {
        const msg = "Title is required";
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "title", message: msg }],
        }, msg);
        return;
      }

      if (!isRemindersGroupType(type)) {
        const msg = `type must be one of: ${remindersGroupTypes.join(", ")}`;
        sendError(res, 400, {
          code: ErrorCode.VALIDATION_ERROR,
          details: [{ field: "type", message: msg }],
        }, msg);
        return;
      }

      const membership =
        await userRemindersGroupRepository.findByUserAndRemindersGroupId(
          userId,
          group_id.trim(),
        );
      if (!membership) {
        const msg =
          "User does not belong to this group or does not have permissions";
        sendError(res, 403, {
          code: ErrorCode.FORBIDDEN,
          details: [{ field: "group_id", message: msg }],
        }, msg);
        return;
      }

      const updatedGroup = await remindersGroupRepository.update(
        group_id.trim(),
        {
          title: title.trim(),
          type,
          ...(description !== undefined ? { description } : {}),
        },
      );

      if (!updatedGroup) {
        const msg = "Reminder group was not found";
        sendError(res, 404, {
          code: ErrorCode.NOT_FOUND,
          details: [{ field: "group_id", message: msg }],
        }, msg);
        return;
      }

      sendSuccess(res, 200, updatedGroup, "success");
    } catch (error: unknown) {
      if (error instanceof ServerError) {
        sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
        return;
      }
      const msg = "Internal server error";
      sendError(res, 500, internalErrorBody(msg), msg);
    }
  }

  async getGroup(req: Request, res: Response): Promise<void> {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        const msg = "Unauthorized: user not authenticated";
        sendError(res, 401, {
          code: ErrorCode.UNAUTHORIZED,
          details: [{ field: "authorization", message: msg }],
        }, msg);
        return;
      }

      const groups =
        await userRemindersGroupRepository.findByUserId(userId);
      sendSuccess(res, 200, groups, "success");
    } catch (error: unknown) {
      const detail = serverErrorMessage(error);
      sendError(res, 500, internalErrorBody(detail), detail);
    }
  }

  async getInvitedGroups(req: Request, res: Response): Promise<void> {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        const msg = "Unauthorized: user not authenticated";
        sendError(res, 401, {
          code: ErrorCode.UNAUTHORIZED,
          details: [{ field: "authorization", message: msg }],
        }, msg);
        return;
      }

      const groups =
        await userRemindersGroupRepository.findInvitedByUserId(userId);
      sendSuccess(res, 200, groups, "success");
    } catch (error: unknown) {
      const detail = serverErrorMessage(error);
      sendError(res, 500, internalErrorBody(detail), detail);
    }
  }

  async getGroupDetails(req: Request, res: Response): Promise<void> {
    try {
      const { group_id } = req.params as {
        group_id: string;
      };

      const groupMembers =
        await userRemindersGroupRepository.findByRemindersGroupId(group_id);

      const groupDetails =
        await remindersGroupRepository.findById(group_id);

      if (!groupDetails) {
        const msg = "Reminder group was not found"
        sendError(res, 404, {
          code: ErrorCode.NOT_FOUND,
          details: [{ field: "group_id", message: msg }],
        }, msg);
        return;
      }

      sendSuccess(
        res,
        200,
        { groupDetails, groupMembers },
        "success",
      );
    } catch (error: unknown) {
      const detail = serverErrorMessage(error);
      sendError(res, 500, internalErrorBody(detail), detail);
    }
  }

  async inviteToGroup(req: Request, res: Response): Promise<void> {
    const notInAppMsg = "This person doesn't use this app";
    try {
      const { group_id } = req.params as { group_id: string };
      const { email } = req.body as { email?: unknown };
      const inviterId = getAuthUserId(req);

      if (!inviterId) {
        const msg = "Unauthorized: user not authenticated";
        sendError(
          res,
          401,
          {
            code: ErrorCode.UNAUTHORIZED,
            details: [{ field: "authorization", message: msg }],
          },
          msg,
        );
        return;
      }

      if (typeof group_id !== "string" || !group_id.trim()) {
        const msg = "group_id is required";
        sendError(
          res,
          400,
          {
            code: ErrorCode.VALIDATION_ERROR,
            details: [{ field: "group_id", message: msg }],
          },
          msg,
        );
        return;
      }

      if (typeof email !== "string" || !email.trim()) {
        const msg = "email is required";
        sendError(
          res,
          400,
          {
            code: ErrorCode.VALIDATION_ERROR,
            details: [{ field: "email", message: msg }],
          },
          msg,
        );
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
        const msg = "Please provide a valid email";
        sendError(
          res,
          400,
          {
            code: ErrorCode.VALIDATION_ERROR,
            details: [{ field: "email", message: msg }],
          },
          msg,
        );
        return;
      }

      const gid = group_id.trim();
      const group = await remindersGroupRepository.findById(gid);
      if (!group) {
        const msg = "Reminder group was not found";
        sendError(
          res,
          404,
          {
            code: ErrorCode.NOT_FOUND,
            details: [{ field: "group_id", message: msg }],
          },
          msg,
        );
        return;
      }

      const invitee = await userRepository.findByEmail(normalizedEmail);
      if (!invitee) {
        sendError(
          res,
          404,
          {
            code: ErrorCode.NOT_FOUND,
            details: [{ field: "email", message: notInAppMsg }],
          },
          notInAppMsg,
        );
        return;
      }

      const inviteeId = plainUserId(invitee);
      if (!inviteeId) {
        const msg = "Invitee user record has no id";
        sendError(res, 500, internalErrorBody(msg), msg);
        return;
      }

      if (inviteeId === inviterId) {
        const msg = "Cannot invite yourself";
        sendError(
          res,
          400,
          {
            code: ErrorCode.VALIDATION_ERROR,
            details: [{ field: "email", message: msg }],
          },
          msg,
        );
        return;
      }

      const { inserted, doc: membership } =
        await userRemindersGroupRepository.createMemberIfAbsent({
          userId: inviteeId,
          remindersGroupId: gid,
          role: "invited",
        });

      if (!inserted) {
        const msg = "This user is already a member of this group";
        sendError(
          res,
          409,
          {
            code: ErrorCode.CONFLICT,
            details: [{ field: "email", message: msg }],
          },
          msg,
        );
        return;
      }

      const inviter = await userRepository.findById(inviterId);
      const inviterName =
        typeof inviter?.name === "string" && inviter.name.trim()
          ? inviter.name.trim()
          : "Someone";
      const groupTitle =
        typeof group.title === "string" && group.title.trim()
          ? group.title.trim()
          : "a group";
      const appLink =
        typeof ENVIRONTMENT.URL_FRONTEND === "string" &&
        ENVIRONTMENT.URL_FRONTEND
          ? ENVIRONTMENT.URL_FRONTEND
          : "";

      await mailerTransporter.sendMail({
        from: ENVIRONTMENT.MAIL_EMAIL,
        to: normalizedEmail,
        subject: `You've been invited to join "${groupTitle}"`,
        html: `
          <p>${inviterName} invited you to join the group <strong>${groupTitle}</strong>.</p>
          ${
            appLink
              ? `<p><a href="${appLink}">Open the app</a> to see your groups.</p>`
              : ""
          }
          <p>If you did not expect this invitation, you can ignore this email.</p>
        `,
      });

      sendSuccess(res, 201, membership, "Invitation sent");
    } catch (error: unknown) {
      if (error instanceof ServerError) {
        sendError(
          res,
          error.status,
          apiErrorBodyFromServerError(error),
          error.message,
        );
        return;
      }
      const msg = "Internal server error";
      sendError(res, 500, internalErrorBody(msg), msg);
    }
  }
}

export default GroupsController;
