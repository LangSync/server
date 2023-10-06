const read = require("../database/read");
const update = require("../database/update");
const Joi = require("joi");
const {
  generateMessageToOpenAI,
  makeOpenAIRequest,
  jsonFromEncapsulatedFields,
  canBeDecodedToJsonSafely,
} = require("../../controllers/openai/utils");

async function _handlePartitionsTranslations(partitions, langs) {
  console.log(`Starting to translate ${partitions.length} partitions found.`);

  let resultTranslations = [];

  for (let indexLang = 0; indexLang < langs.length; indexLang++) {
    let currentLang = langs[indexLang];
    let currentLangResult = [];

    console.log(`Translating to ${currentLang}..`);

    let openAIMessages = [];

    for (let index = 0; index < partitions.length; index++) {
      console.log(`Translating partition ${index + 1}..`);
      const currentPartition = partitions[index];

      let messageToOpenAI = generateMessageToOpenAI(
        currentPartition,
        currentLang
      );

      openAIMessages.push(messageToOpenAI);
    }

    // let currentPartitionResult = await ;

    // currentLangResult.push(currentPartitionResult.choices[0].message.content);
    // console.log(`Partition ${index + 1} translated.`);

    let promises = openAIMessages.map(
      (messageToOpenAI) => () => makeOpenAIRequest(messageToOpenAI)
    );

    let results = await Promise.all(promises.map((p) => p()));

    currentLangResult = results.map(
      (result) => result.choices[0].message.content
    );

    resultTranslations.push({
      lang: currentLang,
      localizedAt: new Date().toISOString(),
      rawRResultResponse: currentLangResult,
      jsonDecodedResponse: canBeDecodedToJsonSafely(currentLangResult)
        ? jsonFromEncapsulatedFields(currentLangResult)
        : { error: "the output of this partition can't be decoded to JSON" },
    });

    console.log(`All partitions translated to ${currentLang}.`);
  }

  console.log("All partitions translated.");

  return resultTranslations;
}

module.exports = async function processTranslations(req, res) {
  console.log(req.body);

  let apiKey = req.headers.authorization.split(" ")[1];

  if (!apiKey) {
    return res.sendStatus(401).json({ message: "Invalid API key." });
  }

  let schema = Joi.object({
    jsonPartitionsId: Joi.string().min(2).required(),
    langs: Joi.array().items(Joi.string().min(2)).required(),
    includeOutput: Joi.boolean().required(),
  });

  let { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  try {
    const { jsonPartitionsId, langs, includeOutput } = value;

    const userDocFIlter = {
      apiKeys: {
        $elemMatch: {
          apiKey: apiKey,
        },
      },
    };

    console.log("using API key to see if it exists for any user..");

    let userDoc = await read("db", "users", userDocFIlter);

    if (!userDoc) {
      console.log("invalid API key, no user found.");
      return res.status(401).json({ message: "Invalid API key." });
    } else {
      console.log("user with API key found.");
    }

    const filterDoc = {
      partitionId: jsonPartitionsId,
    };

    console.log("retrieving partitions doc with partition id.");

    const partitionsDoc = await read("db", "jsonPartitions", filterDoc);

    if (!partitionsDoc) {
      return res.status(404).json({ message: "Partitions not found." });
    }

    let partitions = partitionsDoc.jsonAsParts;

    let resultTranslations = await _handlePartitionsTranslations(
      partitions,
      langs
    );

    console.log("updating partitions doc with translations..");

    //
    await update("db", "jsonPartitions", filterDoc, {
      $addToSet: {
        output: {
          $each: resultTranslations,
        },
      },
    });

    console.log("partitions doc updated.");

    let response = {
      partitionId: jsonPartitionsId,
    };

    if (includeOutput) {
      console.log("including output in response..");
      response.output = resultTranslations;
    }

    console.log(response);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
