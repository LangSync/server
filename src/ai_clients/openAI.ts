import { OpenAI } from "openai";
import configs from "../configs/openai";
import { LangSyncLogger } from "../controllers/utils/logger";
import { loggingTypes } from "../enum";
import { PromptOptions } from "../type";

export class OpenAIClient implements ArtificialIntelligenceBase {
  constructor() {
    this.init(<string>configs.openAI);
  }

  client!: OpenAI;

  init(apiKey: string): void {
    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  async isHarming(content: string): Promise<boolean> {
    try {
      let modResult = await this.client.moderations.create({
        input: content.toString(),
      });

      new LangSyncLogger().log({
        message: "Moderation request has been processed by OpenAI.",
        type: loggingTypes.info,
      });

      let flagged: boolean = modResult.results[0].flagged;

      return typeof flagged === "boolean" ? flagged : false;
    } catch (error: Error | any) {
      if (error.status === 429) {
        new LangSyncLogger().log({
          message:
            "OpenAI API rate limit reached, waiting 20 seconds for next moderation request",
          type: loggingTypes.warning,
        });

        await new Promise((resolve) =>
          setTimeout(
            resolve,
            configs.delayForRateLimitNextRequestInSeconds * 1000
          )
        );

        new LangSyncLogger().log({
          message: "20 seconds passed, continuing request",
          type: loggingTypes.info,
        });

        return await this.isHarming(content);
      } else {
        throw error;
      }
    }
  }

  async process(
    messageToOpenAI: string
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    try {
      let res = await this.client.chat.completions.create({
        model: configs.jsonOpenAIModel,
        messages: [
          {
            role: "system",
            content: configs.jsonSystemMessage,
          },
          { role: "user", content: messageToOpenAI },
        ],
      });

      new LangSyncLogger().log({
        message: res.choices[0].message.content + "\n",
      });

      return res;
    } catch (error: Error | any) {
      if (error.status === 429) {
        new LangSyncLogger().log({
          message:
            "OpenAI API rate limit reached, waiting 20 seconds for next request",
        });

        await new Promise((resolve) =>
          setTimeout(
            resolve,
            configs.delayForRateLimitNextRequestInSeconds * 1000
          )
        );

        new LangSyncLogger().log({
          message: "20 seconds passed, repeating request..",
        });
        return await this.process(messageToOpenAI);
      } else {
        throw error;
      }
    }
  }

  partitionLocalizationPrompt(options: PromptOptions): string {
    return configs.jsonUserMessage(options);
  }

  async makeOpenAIRequest(
    messageToOpenAI: string
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    return await new OpenAIClient().process(messageToOpenAI);
  }
}
