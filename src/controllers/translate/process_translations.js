const { OpenAI } = require("openai");
const configs = require("../../configs/openai");
const read = require("../database/read");
const Joi = require("joi");

const openai = new OpenAI({
  apiKey: configs.openAI,
});

function _generateMessageToOpenAI(partition, lang) {
  return configs.jsonUserMessage(partition, lang);
}

async function _handlePartitionsTranslations(partitions, langs) {
  let resultTranslations = [];

  for (let indexLang = 0; indexLang < langs.length; indexLang++) {
    let currentLang = langs[indexLang];
    let currentLangResult = [];

    for (let index = 0; index < partitions.length; index++) {
      const currentPartition = partitions[index];

      let messageToOpenAI = _generateMessageToOpenAI(
        currentPartition,
        currentLang
      );

      let currentPartitionResult = await openai.chat.completions.create({
        model: configs.jsonOpenAIModel,
        messages: [
          {
            role: "system",
            content: jsonSystemMessage,
          },
          { role: "user", content: messageToOpenAI },
        ],
      });

      currentLangResult.push(currentPartitionResult);
    }

    resultTranslations.push({
      lang: currentLang,
      result: currentLangResult,
    });
  }

  return resultTranslations;
}

async function processTranslations(req, res) {
  try {
    let schema = Joi.object({
      jsonPartitionsId: Joi.string().min(2).required(),
      userAuthToken: Joi.string().min(2).required(),
      langs: Joi.array().items(Joi.string().min(2)).required(),
    });

    let { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const { jsonPartitionsId, userAuthToken, langs } = value;

    const filterDoc = {
      partitionId: jsonPartitionsId,
      userAuthToken: userAuthToken,
    };

    const partitionsDoc = await read("db", "jsonPartitions", filterDoc);

    let partitions = partitionsDoc.jsonAsParts;

    let resultTranslations = await _handlePartitionsTranslations(
      partitions,
      langs
    );

    res.status(200).json({ resultTranslations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = processTranslations;
