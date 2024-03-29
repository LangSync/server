import Joi from "joi";
import { Request, Response } from "express";
import { LangSyncDatabase } from "../database/database";
import { LangSyncLogger } from "../utils/logger";
import { loggingTypes } from "../../enum";

export default async function processCliException(req: Request, res: Response) {
  let scheme = Joi.object({
    exception: Joi.string().required(),
    stacktrace: Joi.string().required(),
    platform: Joi.string().required(),
    langsyncVersion: Joi.string().required(),
    Date: Joi.string().required(),
    commandName: Joi.string().required(),
    processId: Joi.string().required().allow(null),
  });

  let { error, value } = scheme.validate(req.body);

  if (error) {
    new LangSyncLogger().log({
      message: error.toString(),
      type: loggingTypes.error,
    });
    return res.status(400).json({ error: error });
  }

  try {
    await LangSyncDatabase.instance.insert.cliException(value);

    return res.status(200).json({ message: "success" });
  } catch (error: Error | any) {
    new LangSyncLogger().log({ message: error, type: loggingTypes.error });
    return res.status(500).json({ error: error });
  }
}
