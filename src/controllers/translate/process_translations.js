const { OpenAI } = require("openai");
const configs = require("../../configs/openai");
const read = require("../database/read");
const Joi = require("joi");

function _generateMessageToOpenAI(partition, lang) {
  return configs.jsonUserMessage(partition, lang);
}

async function _handlePartitionsTranslations(partitions, langs) {
  const openai = new OpenAI({
    apiKey: configs.openAI,
  });

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
  let apiKey = req.headers.authorization.split(" ")[1];

  if (!apiKey) {
    res.sendStatus(401).json({ message: "Invalid API key." });
  }

  let schema = Joi.object({
    jsonPartitionsId: Joi.string().min(2).required(),
    langs: Joi.array().items(Joi.string().min(2)).required(),
  });

  let { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  try {
    const { jsonPartitionsId, langs } = value;

    const userDocFIlter = {
      apiKeys: {
        $elemMatch: {
          apiKey: apiKey,
        },
      },
    };

    let userDoc = await read("db", "users", userDocFIlter);

    if (!userDoc) {
      return res.status(401).json({ message: "Invalid API key." });
    }

    // ...

    const filterDoc = {
      partitionId: jsonPartitionsId,
    };

    const partitionsDoc = await read("db", "jsonPartitions", filterDoc);

    let partitions = partitionsDoc.jsonAsParts;

    let resultTranslations = await _handlePartitionsTranslations(
      partitions,
      langs
    );

    res.status(200).json({ result: resultTranslations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = processTranslations;
