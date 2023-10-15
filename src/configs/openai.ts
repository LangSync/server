function minuteToSeconds(minutes) {
  return minutes * 60;
}
let modelMaximumTokens = 4096;

export default {
  jsonUserMessage: (partition, lang) => {
    let message = `Translate this to ${lang}: ${partition}`;
    return message;
  },
  langsSupportInstruction: `from the given list, filter only strings that relates to some ISO 639-1 language code and return them comma separated without changing their original format.`,
  jsonOpenAIModel: "gpt-3.5-turbo",
  modelMaximumTokens: modelMaximumTokens,
  get maxTokens() {
    let r = modelMaximumTokens * 0.35;

    let fixed = r.toFixed(0);
    return Number(fixed);
  },
  jsonSystemMessage:
    "You're a professional software localizer for key-value pairs, all pairs are separated with brackets (), localize them and return the localized output in the same structure & format as the input and don't include any instructions given to you else than the localized pairs, don't include any other text in the output except the localized pairs.",
  openAI: process.env.OPENAI_API_KEY,
  delayForRateLimitNextRequestInSeconds: minuteToSeconds(1) / 3,
};
