import { delay, sseEvent } from "../utils/utils";
import { Response } from "express";
import * as utils from "../utils/utils";
import { LocalizationProcessor } from "./localization_launguage_processor";
import OpenAI from "openai";

export class TasksResolver {
  static async timeoutPromise(
    languageLocalizationMaxDelay: number
  ): Promise<any> {
    try {
      await delay(languageLocalizationMaxDelay);
      return {
        timedOut: true,
      };
    } catch (error: Error | any) {}
  }
  static async resolveAllLangsLangsPromises(
    langsPromises: LangTaskResult[],
    languageLocalizationMaxDelay: number,
    res: Response
  ) {
    let result = [];

    for (let index = 0; index < langsPromises.length; index++) {
      let curr = langsPromises[index];

      res.write(
        sseEvent({
          message: `\n${curr.lang} (${index + 1}/${langsPromises.length}):`,
          type: "info",
          statusCode: 200,
        })
      );

      let maxDelayPromise = () =>
        this.timeoutPromise(languageLocalizationMaxDelay);

      let start = Date.now();

      let allPartitionsPromise: () => Promise<
        OpenAI.Chat.Completions.ChatCompletion[]
      > = curr.allPartitionsPromise;

      let allPartitionsPromiseResult = await Promise.race([
        allPartitionsPromise(),
        maxDelayPromise(),
      ]);

      if (allPartitionsPromiseResult.timedOut) {
        res.write(
          sseEvent({
            message: `The ${curr.lang} language localization task took more than ${languageLocalizationMaxDelay} seconds, skipping..`,
            type: "warn",
            statusCode: 200,
          })
        );

        // !add a mechanism to to save the AI generated response in the background and expose an option to the user to get it later even if the request timed out here.

        continue;
      }

      let end = Date.now();

      let asSeconds = (end - start) / 1000;

      res.write(
        sseEvent({
          message: `Partition localized successfully in ${asSeconds} seconds, starting to decode the output of the ${curr.lang} language..`,
          type: "info",
          statusCode: 200,
        })
      );

      let asContents = (
        allPartitionsPromiseResult as OpenAI.Chat.Completions.ChatCompletion[]
      ).map((p) => p.choices[0].message.content ?? "");

      let newLangObject = {
        ...curr,
        rawRResultResponse: asContents,
        jsonDecodedResponse: utils.canBeDecodedToJsonSafely(asContents)
          ? utils.jsonFromEncapsulatedFields(asContents)
          : {
              langsyncError:
                "the output of this partition can't be decoded to JSON",
            },
      };

      delete newLangObject.allPartitionsPromise;

      res.write(
        sseEvent({
          message: `Decoded the output of the ${curr.lang} language successfully, continuing..`,
          type: "info",
          statusCode: 200,
        })
      );
      result.push(newLangObject);
    }

    res.write(
      sseEvent({
        message: `\nFinished localizing your input file to all target languages, continuing..\n`,
        type: "info",
        statusCode: 200,
      })
    );
    return result;
  }

  static async handlePartitionsTranslations(
    partitions: any[],
    langs: string[],
    languageLocalizationMaxDelay: number,
    res: Response
  ) {
    res.write(
      sseEvent({
        message: `Starting to localize ${
          partitions.length
        } partitions found from your input file to target languages: ${langs.join(
          ", "
        )}\n`,
        type: "info",
        statusCode: 200,
      })
    );

    let resultTranslationsBeforePromiseResolve: LangTaskResult[] = [];

    langs.forEach((currentLang) => {
      let indexLang = langs.indexOf(currentLang);

      let processor = new LocalizationProcessor({
        index: indexLang,
        lang: currentLang,
        partitions: partitions,
      });

      res.write(processor.scheduleStartSseEventOnAll(langs.length));

      let task: LangTaskResult = processor.taskPromise({
        partitions,
        currentLang,
      });

      resultTranslationsBeforePromiseResolve.push(task);
    });

    let resultTranslationsAfterPromiseResolve =
      await TasksResolver.resolveAllLangsLangsPromises(
        resultTranslationsBeforePromiseResolve,
        languageLocalizationMaxDelay,
        res
      );

    return resultTranslationsAfterPromiseResolve;
  }
}