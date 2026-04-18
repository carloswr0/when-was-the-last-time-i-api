import type { NextFunction, Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import ServerError from "../helpers/error.helper.ts";
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
  const groupId = groupParamId(req.params.workspace_id);

  if (!groupId) {
    res.status(400).json({
      message: "Group ID is required",
      status: 400,
      ok: false,
    });
    return;
  }

  if (!isValidObjectId(groupId)) {
    res.status(400).json({
      message: "Invalid Group ID format",
      status: 400,
      ok: false,
    });
    return;
  }

  try {
    const group = await remindersGroupRepository.findById(groupId);
    if (!group) {
      res.status(404).json({
        message: "Group not found",
        status: 404,
        ok: false,
      });
      return;
    }
    (req as RequestWithGroup).group = group;
    next();
  } catch (error) {
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

export default verifyGroup;
