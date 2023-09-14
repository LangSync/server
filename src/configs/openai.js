module.exports = {
  jsonUserMessage: (partition, lang) => {
    let message = `Translate this to ${lang}: ${partition}`;
    return message;
  },
  langSupportMessage: (lang) => {
    let message = `return 'true' if you can translate to ${lang}, else return 'false'. don't return anything else than true or false.`;
    return message;
  },
  jsonOpenAIModel: "gpt-3.5-turbo",
  jsonSystemMessage:
    "You're a professional localizer for key-value pairs, all key-pairs are separated with brackets, localize them and return the localized output in the same structure & format as the input",
  openAI: process.env.OPENAI_API_KEY,
};
