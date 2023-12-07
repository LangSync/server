import { LangSyncDatabase } from "../database/database";
import { LangSyncLogger } from "../utils/logger";
import { GeneralUtils } from "../utils/general";
import { ExtractedApiKey } from "../../type";
import { ApiError } from "../utils/api_error";

export default async function verifyApiKeyWithUserAuthToken(
  apiKey: ExtractedApiKey,
  onVerified?: () => void
): Promise<void> {
  let document = await LangSyncDatabase.instance.read.userDocByApiKey(apiKey);

  if (!document) {
    throw new ApiError({
      message: "No user with this API key found.",
      statusCode: 401,
    });
  } else {
    new LangSyncLogger().log({ message: "User found with this API key." });

    onVerified && onVerified();

    return;
  }
}

export async function extractAndVerifyApiKeyExistence(
  authorizationHeader: string,
  onSuccess: () => void,
  onError: () => void
): Promise<void> {
  let apiKey =
    GeneralUtils.extractApiKeyFromAuthorizationHeader(authorizationHeader);

  if (!apiKey) {
    onError();
  } else {
    await verifyApiKeyWithUserAuthToken(apiKey, onSuccess);
  }
}
