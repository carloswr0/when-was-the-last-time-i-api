import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { userRemindersGroupRoles } from "../constants/index.ts";
import ServerError from "../helpers/error.helper.ts";
import type { UserRemindersGroupType } from "../models/UserRemindersGroup.ts";
import { userRemindersGroupRepository } from "../repositories/user-reminders-group.repository.ts";

export type RequestWithMembership = Request & {
  membership: UserRemindersGroupType;
};

type AuthJwtPayload = JwtPayload & { id?: string };

function getAuthUserId(req: Request): string | undefined {
  const user = (req as Request & { user?: AuthJwtPayload }).user;
  if (!user || typeof user.id !== "string") return undefined;
  return user.id;
}

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

      const groupId = groupParamId(req.params.workspace_id);
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
            "Usuario no pertenece al workspace o no tiene permisos para acceder",
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
        res.status(error.status || 500).json({
          message: error.message,
          status: error.status || 500,
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
  };
}

export default verifyRolePermissionAndBelonging;
