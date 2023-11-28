import { OpenAI } from "openai";
import configs from "../configs/openai";
export class OpenAIClient implements ArtificialIntelligenceBase {
  constructor() {
    this.init(configs.openAI);
  }

  client: OpenAI;

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

      LangSyncLogger.instance.log({
        message: "Moderation request has been processed by OpenAI.",
        type: loggingTypes.info,
      });

      let flagged: boolean = modResult.results[0].flagged;

      return typeof flagged === "boolean" ? flagged : false;
    } catch (error) {
      if (error.status === 429) {
        LangSyncLogger.instance.log({
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

        LangSyncLogger.instance.log({
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

      LangSyncLogger.instance.log({
        message: res.choices[0].message.content + "\n",
      });

      return res;
    } catch (error) {
      if (error.status === 429) {
        LangSyncLogger.instance.log({
          message:
            "OpenAI API rate limit reached, waiting 20 seconds for next request",
        });

        await new Promise((resolve) =>
          setTimeout(
            resolve,
            configs.delayForRateLimitNextRequestInSeconds * 1000
          )
        );

        LangSyncLogger.instance.log({
          message: "20 seconds passed, repeating request..",
        });
        return await this.process(messageToOpenAI);
      } else {
        throw error;
      }
    }
  }
}
