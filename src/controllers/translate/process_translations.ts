import Joi from "joi";
import { Request, Response } from "express";
import { LangSyncDatabase } from "../database/database";
import { TasksResolver } from "./tasks_resolver";
import { LangSyncLogger } from "../utils/logger";
import { sseEvent } from "../utils/sse";
import { extractAndVerifyApiKeyExistence } from "../auth/validate_api_key_with_user_token";

// @ts-ignore
export default async function processTranslations(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  await extractAndVerifyApiKeyExistence(
    req.headers.authorization ?? "",
    () => {
      res.write(
        sseEvent({
          message: `Your API key is valid, continuing..\n`,
          type: "info",
          statusCode: 200,
        })
      );
    },
    () => {
      return res.end(
        sseEvent({
          message: "No API key provided.",
          type: "error",
          statusCode: 401,
        })
      );
    }
  );

  let schema = Joi.object({
    operationId: Joi.string().min(2).required(),
    langs: Joi.array().items(Joi.string().min(2)).required(),
    includeOutput: Joi.boolean().required(),
    languageLocalizationMaxDelay: Joi.number().max(1000).required(),
    instruction: Joi.string().min(2).optional(),
  });

  let { error, value } = schema.validate(req.body);

  if (error) {
    return res.end(
      sseEvent({
        message: error.toString(),
        type: "error",
        statusCode: 400,
      })
    );
  } else {
    res.write(
      sseEvent({
        message:
          "Your request data syntax is validated successfully, continuing..\n",
        type: "info",
        statusCode: 200,
      })
    );
  }

  try {
    const {
      operationId,
      langs,
      includeOutput,
      languageLocalizationMaxDelay,
      instruction,
    } = value;

    res.write(
      sseEvent({
        message: "Re-checking & validating your input file partitions..",
        type: "info",
        statusCode: 200,
      })
    );

    let saveFileOperationDoc =
      await LangSyncDatabase.instance.read.savedFileByOperationId(operationId);

    if (!saveFileOperationDoc) {
      return res.end(
        sseEvent({
          message: "No partitions found for the provided ID, closing request..",
          type: "error",
          statusCode: 404,
        })
      );
    } else {
      res.write(
        sseEvent({
          message: "Partitions found & validated successfully, continuing..\n",
          type: "info",
          statusCode: 200,
        })
      );
    }

    let partitions = saveFileOperationDoc.jsonAsParts;

    let resultTranslations: any[] =
      await TasksResolver.handlePartitionsTranslations({
        partitions: partitions,
        langs: langs,
        languageLocalizationMaxDelay: languageLocalizationMaxDelay,
        expressResponse: res,
        instruction: instruction,
      });

    res.write(
      sseEvent({
        message:
          "Localization process is done, saving the outputs to our database..",
        type: "info",
        statusCode: 200,
      })
    );

    await LangSyncDatabase.instance.update.updateOperationDoc(
      operationId,
      resultTranslations
    );

    res.write(
      sseEvent({
        message:
          "Saved the outputs to our database, sending the response to client..",
        type: "info",
        statusCode: 200,
      })
    );

    let response: any = {
      operationId: operationId,
    };

    if (includeOutput) {
      new LangSyncLogger().log({
        message: "including output in response..",
      });
      response.output = resultTranslations;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    res.end(
      sseEvent({
        message: JSON.stringify(response),
        type: "result",
        statusCode: 200,
      })
    );
  } catch (error: Error | any) {
    console.error(error);
    res.end(
      sseEvent({
        message: error,
        type: "error",
        statusCode: 500,
      })
    );
  }
}
