module.exports = {
  jsonUserMessage: (partition, lang) => {
    let message = `Translate this to ${lang}: ${partition}`;
    return message;
  },
  jsonOpenAIModel: "gpt-3.5-turbo",
  jsonSystemMessage:
    "You're a professional localizer for key-value pairs, you will localize values of the given fields, don't provide anything else than the actual translations. if the provided input doesn't seep to be a valid translation, write only an error key with the error message value",
  openAI: process.env.OPENAI_API_KEY,
};
