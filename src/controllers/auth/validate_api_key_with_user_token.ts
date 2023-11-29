import { LangSyncDatabase } from "../database/database";
import { LangSyncLogger } from "../utils/logger";

export default async function verifyApiKeyWithUserAuthToken(
  apiKey: ExtractedApiKey,
  onVerified?: () => void
): Promise<void> {
  let document = await LangSyncDatabase.instance.read.userDocByApiKey(apiKey);

  if (!document) {
    throw new Error("No user with this API key found.");
  } else {
    new LangSyncLogger().log({ message: "User found with this API key." });

    onVerified && onVerified();

    return;
  }
}
