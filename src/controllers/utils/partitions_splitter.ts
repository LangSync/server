import { getEncoding } from "js-tiktoken";
const enc = getEncoding("gpt2");

import configs from "../../configs/openai";

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
