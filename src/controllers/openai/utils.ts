import { OpenAI } from "openai";
import configs from "../../configs/openai";

function canBeDecodedToJsonSafely(encapsulatedFieldsString) {
  try {
    let decoded = jsonFromEncapsulatedFields(encapsulatedFieldsString);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function jsonFromEncapsulatedFields(encapsulatedFieldsString) {
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

function generateMessageToOpenAI(partition, lang) {
  return configs.jsonUserMessage(partition, lang);
}

async function makeOpenAIRequest(messageToOpenAI) {
  const openai = new OpenAI({
    apiKey: configs.openAI,
  });

  try {
    let res = await openai.chat.completions.create({
      model: configs.jsonOpenAIModel,
      messages: [
        {
          role: "system",
          content: configs.jsonSystemMessage,
        },
        { role: "user", content: messageToOpenAI },
      ],
    });

    return res;
  } catch (error) {
    if (error.status === 429) {
      console.log(
        "OpenAI API rate limit reached, waiting 20 seconds for next request"
      );

      await new Promise((resolve) =>
        setTimeout(
          resolve,
          configs.delayForRateLimitNextRequestInSeconds * 1000
        )
      );

      console.log("20 seconds passed, repeating request..");
      return await makeOpenAIRequest(messageToOpenAI);
    } else {
      throw error;
    }
  }
}

export default {
  canBeDecodedToJsonSafely: canBeDecodedToJsonSafely,
  jsonFromEncapsulatedFields: jsonFromEncapsulatedFields,
  generateMessageToOpenAI: generateMessageToOpenAI,
  makeOpenAIRequest: makeOpenAIRequest,
};
