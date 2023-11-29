import Joi from "joi";
import { Request, Response } from "express";

import { LangSyncDatabase } from "../database/database";
import { extractAndVerifyApiKeyExistence } from "../utils/utils";

export default async function fileOperationOfUser(req: Request, res: Response) {
  await extractAndVerifyApiKeyExistence(
    req.headers.authorization ?? "",
    () => {},
    () => {
      return res.status(401).json({
        message:
          "You need to provide a valid Bearer API key in the authorization header.",
      });
    }
  );

  let schema = Joi.object({
    operationId: Joi.string().min(2).required(),
  });

  let { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  try {
    let docs = await LangSyncDatabase.instance.read.userOperations(
      value.operationId
    );

    let doc = docs[0];

    if (!doc) {
      return res.status(404).json({
        message: "No such operation found for id " + value.operationId,
      });
    } else {
      return res.status(200).json(doc);
    }
  } catch (error: Error | any) {
    LangSyncLogger.instance.log({
      message: error,
      type: loggingTypes.error,
    });

    return res.status(500).json({ message: error });
  }
}