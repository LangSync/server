import OpenAI from "openai";
import { sseEvent } from "../utils/sse";
import { OpenAIClient } from "../../ai_clients/openAI";

export class LocalizationProcessor {
  constructor(private options: LocalizationProcessorOptions) {}

  taskPromise(options: LangTaskOptions): LangTaskResult {
    let openAIMessages: string[] = this.requestMessagesForOpenAI(
      options.partitions,
      options.currentLang
    );

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

  requestMessagesForOpenAI(partitions: any[], lang: string): string[] {
    let result: string[] = [];

    for (let index = 0; index < partitions.length; index++) {
      const currentPartition = partitions[index];

      let messageToOpenAI: string =
        new OpenAIClient().partitionLocalizationPrompt(currentPartition, lang);

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
