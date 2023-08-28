const { OpenAI } = require("openai");
const configs = require("../../configs/openai");
const read = require("../database/read");

const openai = new OpenAI({
  apiKey: configs.openAI,
});

module.exports = async function processTranslations(req, res) {
  const { jsonPartitionsId } = req.body;
  const filterDoc = { _id: jsonPartitionsId };
  const partitionsDoc = await read("db", "jsonPartitions");
};
