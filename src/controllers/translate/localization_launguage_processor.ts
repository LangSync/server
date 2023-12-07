import OpenAI from "openai";
import { sseEvent } from "../utils/sse";
import { OpenAIClient } from "../../ai_clients/openAI";
import {
  LangTaskOptions,
  LangTaskResult,
  LocalizationProcessorOptions,
  PartitionsMessagesOptions,
} from "../../type";

export class LocalizationProcessor {
  constructor(private options: LocalizationProcessorOptions) {}

  taskPromise(options: LangTaskOptions): LangTaskResult {
    let openAIMessages: string[] = this.requestMessagesForOpenAI({
      partitions: options.partitions,
      lang: options.currentLang,
      instruction: options.instruction,
    });

    let promises = this.openAIRequestsFrom(openAIMessages);

    let langAllPartitionsPromise = () => Promise.all(promises.map((p) => p()));

    return {
      lang: options.currentLang,
      localizedAt: new Date().toISOString(),
      allPartitionsPromise: langAllPartitionsPromise,
    };
  }

  scheduleStartSseEventOnAll(langsLength: number): any {
    return sseEvent({
      message: `Scheduling the ${
        this.options.lang
      } language localization task. (lang ${
        this.options.index + 1
      }/${langsLength})`,
      type: "info",
      statusCode: 200,
    });
  }

  requestMessagesForOpenAI(options: PartitionsMessagesOptions): string[] {
    let result: string[] = [];

    for (let index = 0; index < options.partitions.length; index++) {
      const currentPartition = options.partitions[index];

      let messageToOpenAI: string =
        new OpenAIClient().partitionLocalizationPrompt({
          partition: currentPartition,
          lang: options.lang,
          instruction: options.instruction,
        });

      result.push(messageToOpenAI);
    }

    return result;
  }

  openAIRequestsFrom(
    openAIMessages: string[]
  ): (() => Promise<OpenAI.Chat.Completions.ChatCompletion>)[] {
    return openAIMessages.map(
      (messageToOpenAI) => () =>
        new OpenAIClient().makeOpenAIRequest(messageToOpenAI)
    );
  }
}
