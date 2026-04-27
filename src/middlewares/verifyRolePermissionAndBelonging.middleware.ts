import type { NextFunction, Request, Response } from "express";
import { userRemindersGroupRoles } from "../constants/index.ts";
import { getAuthUserId } from "../helpers/authUser.helper.ts";
import ServerError, {
  apiErrorBodyFromServerError,
  internalErrorBody,
} from "../helpers/error.helper.ts";
import { sendError } from "../helpers/response.helper.ts";
import type { UserRemindersGroupType } from "../models/UserRemindersGroup.ts";
import { userRemindersGroupRepository } from "../repositories/user-reminders-group.repository.ts";

export type RequestWithMembership = Request & {
  membership: UserRemindersGroupType;
};

function groupParamId(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  const s = Array.isArray(value) ? value[0] : value;
  return typeof s === "string" && s ? s : undefined;
}

function verifyRolePermissionAndBelonging(
  valid_roles: readonly (typeof userRemindersGroupRoles)[number][] = [],
) {
  return async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        throw new ServerError({
          status: 401,
          message: "Unauthorized: user not authenticated",
          ok: false,
        });
      }

      const groupId = groupParamId(req.params.group_id);
      if (!groupId) {
        throw new ServerError({
          status: 403,
          message: "Group ID is required",
          ok: false,
        });
      }

      const membership =
        await userRemindersGroupRepository.findByUserAndRemindersGroupId(
          userId,
          groupId,
        );

      if (!membership) {
        throw new ServerError({
          status: 403,
          message:
            "User does not belong to this group or does not have permissions",
          ok: false,
        });
      }

      const requiresRoleCheck = valid_roles.length > 0;
      const userRoleIsValid = valid_roles.includes(membership.role);
      const noPermission = requiresRoleCheck && !userRoleIsValid;
      if (noPermission) {
        throw new ServerError({
          message: "Rol no tiene permisos suficientes",
          status: 403,
        });
      }

      (req as RequestWithMembership).membership = membership;
      next();
    } catch (error) {
      if (error instanceof ServerError) {
        const status = error.status || 500;
        sendError(res, status, apiErrorBodyFromServerError(error), error.message);
        return;
      }
      sendError(res, 500, internalErrorBody("Internal server error"), "Internal server error");
    }
  };
}

export default verifyRolePermissionAndBelonging;
