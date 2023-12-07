import { PromptOptions } from "../type";

function minuteToSeconds(minutes: number): number {
  return minutes * 60;
}
let modelMaximumTokens: number = 1300;

if (process.env.DEBUG) {
  console.log("DEBUG MODE");
}

export default {
  jsonUserMessage: (options: PromptOptions): string => {
    let translateMessage: string = `Translate this to ${options.lang}: ${options.partition}`;
    let instruction: string = options.instruction || "";

    return `${instruction}\n${translateMessage}`;
  },
  langsSupportInstruction: `from the given list, filter only strings that relates to some ISO 639-1 language code and return them comma separated without changing their original format.`,
  jsonOpenAIModel: "gpt-3.5-turbo",
  modelMaximumTokens: modelMaximumTokens,
  get maxTokens() {
    let r: number = modelMaximumTokens * 0.35;

    let fixed: string = r.toFixed(0);
    return Number(fixed);
  },
  jsonSystemMessage:
    "You're a professional software localizer for key-value pairs, all pairs are separated with brackets (), I will prompt you with a localization instruction and the pairs, you will localize and return the localized pairs in the same format & syntax only, don't include the instruction in the response, only the localized pairs.",
  openAI: process.env.DEBUG
    ? process.env.OPENAI_API_KEY_DEBUG
    : process.env.OPENAI_API_KEY_PROD,
  delayForRateLimitNextRequestInSeconds: minuteToSeconds(1) / 3,
};
