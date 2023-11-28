function minuteToSeconds(minutes: number): number {
  return minutes * 60;
}
let modelMaximumTokens: number = 1300;

export default {
  jsonUserMessage: (partition: any, lang: string): string => {
    let message: string = `Translate this to ${lang}: ${partition}`;
    return message;
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
  openAI: process.env.OPENAI_API_KEY,
  delayForRateLimitNextRequestInSeconds: minuteToSeconds(1) / 3,
};
