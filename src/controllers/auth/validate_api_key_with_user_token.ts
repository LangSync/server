import { LangSyncDatabase } from "../database/database";

export default async function verifyApiKeyWithUserAuthToken(
  apiKey: ExtractedApiKey,
  onVerified?: () => void
): Promise<void> {
  let document = await LangSyncDatabase.instance.read.userDocByApiKey(apiKey);

  if (!document) {
    throw new Error("No user with this API key found.");
  } else {
    LangSyncLogger.instance.log({ message: "User found with this API key." });

    onVerified && onVerified();

    return;
  }
}
