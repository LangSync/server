const { OpenAI } = require("openai");
const configs = require("../../configs/openai");
const read = require("../database/read");

const openai = new OpenAI({
  apiKey: configs.openAI,
});

module.exports = async function processTranslations(req, res) {
  try {
    const { jsonPartitionsId } = req.body;
    const filterDoc = { partitionId: jsonPartitionsId };
    const partitionsDoc = await read("db", "jsonPartitions", filterDoc);

    console.log("partitionsDoc", partitionsDoc);

    res.status(200).json({ partitionsDoc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
