module.exports = {
  jsonUserMessage: (partition, lang) => {
    let message = `Translate this to ${lang}: ${partition}`;
    return message;
  },
  jsonOpenAIModel: "gpt-3.5-turbo",
  jsonSystemMessage:
    "You're a professional localizer for key-value pairs, you will localize values of the given fields",
  openAI: process.env.OPENAI_API_KEY,
};
