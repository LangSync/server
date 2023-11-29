import fs from "fs";
import * as utils from "../controllers/utils/general";
import { v4 } from "uuid";
import { OpenAIClient } from "../ai_clients/openAI";
import { LangSyncLogger } from "../controllers/utils/logger";
import { loggingTypes } from "../enum";
import { parsedFileContentPartsSeparatorForOpenAI } from "../controllers/utils/partitions_splitter";

export class JsonAdapter implements BaseAdapter {
  constructor(private filePath: string) {}

  get aiClient(): OpenAIClient {
    return new OpenAIClient();
  }

  numberOfGeneratedUniqueIds: number = 0;
  allowMultipleUniqueIds: boolean = false;

  deleteFile() {
    if (fs.existsSync(this.filePath)) {
      fs.unlinkSync(this.filePath);
    }
  }

  readFileAsString(): string {
    let asString: string = fs.readFileSync(this.filePath, "utf8");
    new LangSyncLogger().log({
      message: `File named ${this.filePath
        .split("/")
        .pop()} has been loaded as a string.`,
      type: loggingTypes.info,
    });

    return asString;
  }

  parseString(fileContent: string): any {
    return JSON.parse(fileContent);
  }
  // @ts-ignore
  async isHarming(options: HarmOptions): Promise<boolean> {
    let isHarming: boolean = await this.aiClient.isHarming(options.fileContent);

    if (isHarming) {
      new LangSyncLogger().log({
        message:
          "The provided content violates our policy, and so it is unacceptable to be processed.",
      });

      if (options.throwIfHarming) {
        throw new Error(
          "The provided content violates our policy, and so it is unacceptable to be processed."
        );
      } else {
      }
    } else {
      new LangSyncLogger().log({
        message: "The provided content is acceptable to be processed.",
      });

      return isHarming === false;
    }
  }

  async asPartsForOpenAI(): Promise<string[]> {
    let asString: string = this.readFileAsString();

    // @ts-ignore
    let isHarming: boolean = await this.isHarming({
      fileContent: asString,
      throwIfHarming: true,
    });

    let parsed: any = this.parseString(asString);

    let asParts: string[] = await parsedFileContentPartsSeparatorForOpenAI(
      parsed
    );

    new LangSyncLogger().log({
      message: `File named ${this.filePath
        .split("/")
        .pop()} has been split into ${asParts.length} parts.`,
      type: loggingTypes.info,
    });

    return asParts;
  }

  generateUniqueId(): string {
    if (
      this.numberOfGeneratedUniqueIds >= 1 &&
      this.allowMultipleUniqueIds === false
    ) {
      throw new Error(
        "Cannot generate more than one unique id for a single file"
      );
    }

    const generatedId = v4();

    this.numberOfGeneratedUniqueIds++;

    return generatedId;
  }
}
