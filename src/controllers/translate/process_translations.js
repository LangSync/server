const { OpenAI } = require("openai");
const configs = require("../../configs/openai");
const read = require("../database/read");
const update = require("../database/update");
const Joi = require("joi");

async function _makeOpenAIRequest(messageToOpenAI) {
  const openai = new OpenAI({
    apiKey: configs.openAI,
  });

  try {
    let res = await openai.chat.completions.create({
      model: configs.jsonOpenAIModel,
      messages: [
        {
          role: "system",
          content: configs.jsonSystemMessage,
        },
        { role: "user", content: messageToOpenAI },
      ],
    });

    return res;
  } catch (error) {
    if (error.status === 429) {
      console.log(
        "OpenAI API rate limit reached, waiting 20 seconds for next request"
      );

      await new Promise((resolve) => setTimeout(resolve, 20 * 1000));
      console.log("20 seconds passed, continuing request");
      return await _makeOpenAIRequest(messageToOpenAI);
    } else {
      throw error;
    }
  }
}
function _generateMessageToOpenAI(partition, lang) {
  return configs.jsonUserMessage(partition, lang);
}

function _canBeDecodedToJsonSafely(encapsulatedFieldsString) {
  try {
    let decoded = _jsonFromEncapsulatedFields(encapsulatedFieldsString);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function _jsonFromEncapsulatedFields(encapsulatedFieldsString) {
  let replacedSymbols = encapsulatedFieldsString
    .join("")
    .replaceAll("(", "")
    .replaceAll(")", "")
    .replaceAll(`\"`, `"`)
    .replaceAll("\n", "")
    .replaceAll('""', '"\n"');

  let asLines = replacedSymbols.split("\n");

  for (let index = 0; index < asLines.length - 1; index++) {
    asLines[index] = asLines[index] + ", ";
  }

  let asStringifedJson = "{" + asLines.join("\n") + "}";

  return JSON.parse(asStringifedJson);
}

async function _handlePartitionsTranslations(partitions, langs) {
  console.log(`Starting to translate ${partitions.length} partitions found.`);

  let resultTranslations = [];

  for (let indexLang = 0; indexLang < langs.length; indexLang++) {
    let currentLang = langs[indexLang];
    let currentLangResult = [];

    console.log(`Translating to ${currentLang}..`);

    for (let index = 0; index < partitions.length; index++) {
      console.log(`Translating partition ${index + 1}..`);
      const currentPartition = partitions[index];

      let messageToOpenAI = _generateMessageToOpenAI(
        currentPartition,
        currentLang
      );

      let currentPartitionResult = await _makeOpenAIRequest(messageToOpenAI);

      currentLangResult.push(currentPartitionResult.choices[0].message.content);
      console.log(`Partition ${index + 1} translated.`);
    }

    resultTranslations.push({
      lang: currentLang,
      localizedAt: new Date().toISOString(),
      rawRResultResponse: currentLangResult,
      jsonDecodedResponse: _canBeDecodedToJsonSafely(currentLangResult)
        ? _jsonFromEncapsulatedFields(currentLangResult)
        : { error: "the output of this partition can't be decoded to JSON" },
    });
    console.log(`All partitions translated to ${currentLang}.`);
  }

  console.log("All partitions translated.");

  return resultTranslations;
}

module.exports = async function processTranslations(req, res) {
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
