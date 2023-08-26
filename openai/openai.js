const OpenAI = require("openai");

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const instruction =
  "You're a json files localizer, I will provide you with some json entries, and I want you to localize them to the language t";
