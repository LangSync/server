import { Request, Response } from "express";
import verifyApiKeyWithUserAuthToken from "../auth/validate_api_key_with_user_token";
import { JsonAdapter } from "../../adapters/json";
import { LangSyncDatabase } from "../database/database";
import { LangSyncLogger } from "../utils/logger";
import { loggingTypes } from "../../enum";
import { GeneralUtils } from "../utils/general";

export default async function saveFile(req: Request, res: Response) {
  let fileType = req.params.fileType;

  let filePath: string = GeneralUtils.getFilePath(req.file!.path);

  let adapter = new JsonAdapter(filePath);

  try {
    adapter.validateFileTypeSupport(fileType);

    let apiKey: ExtractedApiKey =
      GeneralUtils.extractApiKeyFromAuthorizationHeader(
        req.headers.authorization ?? ""
      );

    await verifyApiKeyWithUserAuthToken(apiKey);

    let parsedAsObject = adapter.parseString();
    let fileAsParts = await adapter.asPartsForAIClient(parsedAsObject);

    let userDoc = await LangSyncDatabase.instance.read.userDocByApiKey(apiKey);

    let operationId = adapter.generateUniqueId();

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
  } catch (error: Error | any) {
    new LangSyncLogger().log({
      message: error,
      type: loggingTypes.error,
    });

    adapter.deleteFile();

    res.status(500).json({ message: "Internal server error", error: error });
  }
}
