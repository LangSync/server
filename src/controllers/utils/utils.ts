import { OpenAI } from "openai";
import { getEncoding } from "js-tiktoken";
import configs from "../../configs/openai";
import { OpenAIClient } from "../../ai_clients/openAI";
import verifyApiKeyWithUserAuthToken from "../auth/validate_api_key_with_user_token";
const enc = getEncoding("gpt2");

export function canBeDecodedToJsonSafely(encapsulatedFieldsString: string[]) {
  try {
    let decoded = jsonFromEncapsulatedFields(encapsulatedFieldsString);

    return true;
  } catch (error: Error | any) {
    LangSyncLogger.instance.log({
      message: error,
      type: loggingTypes.error,
    });

    return false;
  }
}

export function jsonFromEncapsulatedFields(encapsulatedFieldsString: string[]) {
  let replacedSymbols = encapsulatedFieldsString
    .join("")
    .replaceAll("(", "")
    .replaceAll(")", "")
    .replaceAll(`\"`, `"`)
    .replaceAll("\n", "")
    .replaceAll('""', '"\n"');

  let asLines = replacedSymbols.split("\n");

  for (let index = 0; index < asLines.length - 1; index++) {
    asLines[index] = asLines[index] + ", ";
  }

  let asStringifedJson = "{" + asLines.join("\n") + "}";

  return JSON.parse(asStringifedJson);
}

export function generateMessageToOpenAI(partition: any, lang: string): string {
  return configs.jsonUserMessage(partition, lang);
}

export async function makeOpenAIRequest(
  messageToOpenAI: string
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  return await new OpenAIClient().process(messageToOpenAI);
}

export function getFilePath(path: string): string {
  return path;
}

export function extractApiKeyFromAuthorizationHeader(
  authorizationHeader: string
): ExtractedApiKey {
  return authorizationHeader.split(" ")[1];
}

export function validateFileTypeSupport(fileType: string): void {
  let exists: boolean = Object.keys(LangSyncAllowedFileTypes).includes(
    fileType
  );

  if (!exists) {
    throw new Error("File type not supported.");
  }
}
export async function parsedFileContentPartsSeparatorForOpenAI(
  parsedJson: any
): Promise<string[]> {
  let maxTokens = configs.maxTokens;

  let parts = [];

  let latestPart = "";
  let latestPartTokens = 0;

  let entries = Object.entries(parsedJson);

  for (let index = 0; index < entries.length; index++) {
    let key = entries[index][0];
    let value = entries[index][1];

    let entry = String.raw`("${key}": "${value}")`;

    let encoded = enc.encode(entry);

    let tokensSum = encoded.length + latestPartTokens;

    if (tokensSum >= maxTokens) {
      parts.push(latestPart);

      latestPart = "";
      latestPartTokens = 0;

      index -= 1;

      continue;
    }

    latestPart += entry;
    latestPartTokens += encoded.length;

    if (
      index == entries.length - 1 &&
      latestPart != "" &&
      latestPartTokens < maxTokens
    ) {
      parts.push(latestPart);
    }

    // await new Promise((resolve) => setTimeout(resolve, 10));
  }

  return parts;
}

export function delay(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export function sseEvent(event: SseEvent): string {
  let types: string[] = ["warn", "info", "error", "result"];

  if (!types.includes(event.type)) {
    event.type = "info";
  }

  let obj: SseResponseEvent = {
    ...event,
    date: new Date().toISOString(),
  };

  return JSON.stringify(obj) + "\n\n";
}
export async function extractAndVerifyApiKeyExistence(
  authorizationHeader: string,
  onSuccess: () => void,
  onError: () => void
): Promise<void> {
  let apiKey = extractApiKeyFromAuthorizationHeader(authorizationHeader);

  if (!apiKey) {
    onError();
  } else {
    await verifyApiKeyWithUserAuthToken(apiKey, onSuccess);
  }
}
