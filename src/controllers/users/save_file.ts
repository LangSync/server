import { Request, Response } from "express";
import fs from "fs";
import * as utils from "../utils/utils";
import verifyApiKeyWithUserAuthToken from "../auth/validate_api_key_with_user_token";
import { JsonAdapter } from "../../adapters/json";
import { LangSyncDatabase } from "../database/database";

export default async function saveFile(req: Request, res: Response) {
  try {
    let fileType = req.params.fileType;
    utils.validateFileTypeSupport(fileType);

    let apiKey: ExtractedApiKey = utils.extractApiKeyFromAuthorizationHeader(
      req.headers.authorization
    );
    await verifyApiKeyWithUserAuthToken(apiKey);

    let filePath: string = utils.getFilePath(req.file.path);

    let adapter = new JsonAdapter(filePath);
    let fileAsParts = adapter.asPartsForOpenAI();

    let operationId = adapter.generateUniqueId();

    let userDoc = await LangSyncDatabase.instance.read.userDocByApiKey(apiKey);

    await LangSyncDatabase.instance.insert.fileOperation({
      userId: userDoc.userId,
      operationId: operationId,
      createdAt: new Date().toISOString(),
      jsonAsParts: fileAsParts,
    });

    adapter.deleteFile();

    res.status(200).json({
      message: "Successfully saved partitioned json",
      operationId: operationId,
    });
  } catch (error) {
    LangSyncLogger.instance.log({
      message: error,
      type: loggingTypes.error,
    });

    res.status(500).json({ message: "Internal server error", error: error });
  }
}
