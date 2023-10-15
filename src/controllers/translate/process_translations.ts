import read from "../database/read";
import update from "../database/update";
import Joi from "joi";
import openAIUtils from "../../controllers/openai/utils";
import * as express from "express";
import { Application, Request, Response, NextFunction } from "express";

function sseEvent(message, type, statusCode) {
  let types = ["warn", "info", "error", "result"];
  if (!types.includes(type)) {
    type = "info";
  }

  let obj = {
    message: message,
    type: type,
    date: new Date().toISOString(),
    statusCode: statusCode,
  };

  return JSON.stringify(obj);
}

async function resolveAllLangsLangsPromises(langsPromises, res) {
  let result = [];

  for (let index = 0; index < langsPromises.length; index++) {
    let curr = langsPromises[index];

    res.write(
      sseEvent(
        `\n${curr.lang} (${index + 1}/${langsPromises.length}):`,
        "info",
        200
      )
    );
    res.write(sseEvent(`Starting localazing..`, "info", 200));
    let allPartitionsPromiseResult = await curr.allPartitionsPromise();

    res.write(
      sseEvent(
        `Partition localized successfully, starting to decode the output of the ${curr.lang} language..`,
        "info",
        200
      )
    );

    let asContents = allPartitionsPromiseResult.map(
      (p) => p.choices[0].message.content
    );

    console.log(asContents);

    let newLangObject = {
      ...curr,
      rawRResultResponse: asContents,
      jsonDecodedResponse: openAIUtils.canBeDecodedToJsonSafely(asContents)
        ? openAIUtils.jsonFromEncapsulatedFields(asContents)
        : {
            langsyncError:
              "the output of this partition can't be decoded to JSON",
          },
    };

    delete newLangObject.allPartitionsPromise;

    res.write(
      sseEvent(
        `Decoded the output of the ${curr.lang} language successfully, continuing..`,
        "info",
        200
      )
    );
    result.push(newLangObject);
  }

  res.write(
    sseEvent(
      `\nFinished localizing your input file to all target languages, continuing..\n`,
      "info",
      200
    )
  );
  return result;
}

function openAIRequestsFrom(openAIMessages) {
  return openAIMessages.map(
    (messageToOpenAI) => () => openAIUtils.makeOpenAIRequest(messageToOpenAI)
  );
}

function requestMessagesForOpenAI(partitions, lang) {
  let result = [];

  for (let index = 0; index < partitions.length; index++) {
    const currentPartition = partitions[index];

    let messageToOpenAI = openAIUtils.generateMessageToOpenAI(
      currentPartition,
      lang
    );

    result.push(messageToOpenAI);
  }

  return result;
}

async function _handlePartitionsTranslations(partitions, langs, res) {
  res.write(
    sseEvent(
      `Starting to localize ${
        partitions.length
      } partitions found from your input file to target languages: ${langs.join(
        ", "
      )}\n`,
      "info",
      200
    )
  );
  let resultTranslationsBeforePromiseResolve = [];

  for (let indexLang = 0; indexLang < langs.length; indexLang++) {
    let currentLang = langs[indexLang];

    res.write(
      sseEvent(
        `Scheduling the ${currentLang} language localization task. (lang ${
          indexLang + 1
        }/${langs.length})`,
        "info",
        200
      )
    );

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
    resultTranslationsBeforePromiseResolve,
    res
  );

  return resultTranslationsAfterPrmiseResolve;
}

export default async function processTranslations(req: Request, res: Response) {
  let apiKey = req.headers.authorization.split(" ")[1];

  if (!apiKey) {
    return res.end(sseEvent("No API key provided.", "error", 401));
  }

  let schema = Joi.object({
    jsonPartitionsId: Joi.string().min(2).required(),
    langs: Joi.array().items(Joi.string().min(2)).required(),
    includeOutput: Joi.boolean().required(),
  });

  let { error, value } = schema.validate(req.body);

  if (error) {
    return res.end(sseEvent(error, "error", 400));
  } else {
    res.write(
      sseEvent(
        "Your Request data syntax is validated successfully, continuing..\n",
        "info",
        200
      )
    );
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

    res.write(sseEvent("Validating the saved API key..", "info", 200));

    let userDoc = await read("db", "users", userDocFIlter);

    if (!userDoc) {
      return res.end(
        sseEvent("Invalid API key, no match found.", "error", 401)
      );
    } else {
      res.write(
        sseEvent(
          `${userDoc.username}, your API key is valid, continuing..\n`,
          "info",
          200
        )
      );
    }

    const filterDoc = {
      partitionId: jsonPartitionsId,
    };

    res.write(
      sseEvent(
        "Re-checking & validating your input file partitions..",
        "info",
        200
      )
    );

    const partitionsDoc = await read("db", "jsonPartitions", filterDoc);

    if (!partitionsDoc) {
      return res.end(
        sseEvent(
          "No partitions found for the provided ID, closing request..",
          "error",
          404
        )
      );
    } else {
      res.write(
        sseEvent(
          "Partitions found & validated successfully, continuing..\n",
          "info",
          200
        )
      );
    }

    let partitions = partitionsDoc.jsonAsParts;

    let resultTranslations = await _handlePartitionsTranslations(
      partitions,
      langs,
      res
    );

    res.write(
      sseEvent(
        "Localization process is done, saving the outputs to our database..",
        "info",
        200
      )
    );

    await update("db", "jsonPartitions", filterDoc, {
      $addToSet: {
        output: {
          $each: resultTranslations,
        },
      },
    });

    res.write(
      sseEvent(
        "Saved the outputs to our database, sending the response..",
        "info",
        200
      )
    );

    let response: any = {
      partitionId: jsonPartitionsId,
    };

    if (includeOutput) {
      console.log("including output in response..");
      response.output = resultTranslations;
    }

    console.log("111111111111111111111111111111111111111111");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    res.end(sseEvent(JSON.stringify(response), "result", 200));
  } catch (error) {
    console.error(error);
    res.end(sseEvent(error, "error", 500));
  }
}
