import type { NextFunction, Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { ErrorCode } from "../constants/error-codes.ts";
import ServerError, {
  apiErrorBodyFromServerError,
  internalErrorBody,
} from "../helpers/error.helper.ts";
import { sendError } from "../helpers/response.helper.ts";
import type { RemindersGroupType } from "../models/RemindersGroup.ts";
import { remindersGroupRepository } from "../repositories/reminders-group.repository.ts";

export type RequestWithGroup = Request & { group: RemindersGroupType };

function groupParamId(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  const s = Array.isArray(value) ? value[0] : value;
  return typeof s === "string" && s ? s : undefined;
}

async function verifyGroup(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const groupId = groupParamId(req.params.group_id);

  if (!groupId) {
    const msg = "Group ID is required";
    sendError(res, 400, {
      code: ErrorCode.VALIDATION_ERROR,
      details: [{ field: "group_id", message: msg }],
    }, msg);
    return;
  }

  if (!isValidObjectId(groupId)) {
    const msg = "Invalid Group ID format";
    sendError(res, 400, {
      code: ErrorCode.VALIDATION_ERROR,
      details: [{ field: "group_id", message: msg }],
    }, msg);
    return;
  }

  try {
    const group = await remindersGroupRepository.findById(groupId);
    if (!group) {
      const msg = "Group not found";
      sendError(res, 404, {
        code: ErrorCode.NOT_FOUND,
        details: [{ field: "group_id", message: msg }],
      }, msg);
      return;
    }
    (req as RequestWithGroup).group = group;
    next();
  } catch (error) {
    if (error instanceof ServerError) {
      sendError(res, error.status, apiErrorBodyFromServerError(error), error.message);
      return;
    }
    sendError(res, 500, internalErrorBody("Internal server error"), "Internal server error");
  }
}

export default verifyGroup;
