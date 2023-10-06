const read = require("../database/read");
const update = require("../database/update");
const Joi = require("joi");
const {
  generateMessageToOpenAI,
  makeOpenAIRequest,
  jsonFromEncapsulatedFields,
  canBeDecodedToJsonSafely,
} = require("../../controllers/openai/utils");

async function resolveAllLangsLangsPromises(langsPromises) {
  let result = [];

  for (let index = 0; index < langsPromises.length; index++) {
    let curr = langsPromises[index];
    let allPartitionsPromiseResult = await curr.allPartitionsPromise();

    let asContents = allPartitionsPromiseResult.map(
      (p) => p.choices[0].message.content
    );

    let newLangObject = {
      ...curr,
      rawRResultResponse: asContents,
      jsonDecodedResponse: canBeDecodedToJsonSafely(asContents)
        ? jsonFromEncapsulatedFields(asContents)
        : { error: "the output of this partition can't be decoded to JSON" },
    };

    delete newLangObject.allPartitionsPromise;

    result.push(newLangObject);
  }

  return result;
}

function openAIRequestsFrom(openAIMessages) {
  return openAIMessages.map(
    (messageToOpenAI) => () => makeOpenAIRequest(messageToOpenAI)
  );
}

function requestMessagesForOpenAI(partitions, lang) {
  let result = [];

  for (let index = 0; index < partitions.length; index++) {
    console.log(`Translating partition ${index + 1}..`);
    const currentPartition = partitions[index];

    let messageToOpenAI = generateMessageToOpenAI(currentPartition, lang);

    result.push(messageToOpenAI);
  }

  return result;
}

async function _handlePartitionsTranslations(partitions, langs) {
  console.log(`Starting to translate ${partitions.length} partitions found.`);

  let resultTranslationsBeforePromiseResolve = [];

  for (let indexLang = 0; indexLang < langs.length; indexLang++) {
    let currentLang = langs[indexLang];

    console.log(`Translating to ${currentLang}..`);

    let openAIMessages = requestMessagesForOpenAI(partitions, currentLang);
    let promises = openAIRequestsFrom(openAIMessages);
    let langAllPartitionsPromise = () => Promise.all(promises.map((p) => p()));

    resultTranslationsBeforePromiseResolve.push({
      lang: currentLang,
      localizedAt: new Date().toISOString(),
      allPartitionsPromise: langAllPartitionsPromise,
    });
  }

  let resultTranslationsAfterPrmiseResolve = await resolveAllLangsLangsPromises(
    resultTranslationsBeforePromiseResolve
  );

  return resultTranslationsAfterPrmiseResolve;
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
