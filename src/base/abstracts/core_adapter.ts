import { v4 } from "uuid";
import { OpenAIClient } from "../../ai_clients/openAI";
import { LangSyncLogger } from "../../controllers/utils/logger";
import { loggingTypes } from "../../enum";
import fs from "fs";
import { GeneralUtils } from "../../controllers/utils/general";
import { CoreAdapterInterface } from "../interfaces/adapter";
import { parsedFileContentPartsSeparatorForOpenAI } from "../../controllers/utils/partitions_splitter";

export abstract class CoreAdapter implements CoreAdapterInterface {
  filePath: string;

  numberOfGeneratedUniqueIds: number = 0;
  allowMultipleUniqueIds: boolean = false;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  get aiClient(): OpenAIClient {
    return new OpenAIClient();
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
        throw new ApiError({
          message:
            "The provided content violates our policy, and so it is unacceptable to be processed.",
          statusCode: 400,
        });
      } else {
      }
    } else {
      new LangSyncLogger().log({
        message: "The provided content is acceptable to be processed.",
      });

      return isHarming === false;
    }
  }

  deleteFile(): void {
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

  generateUniqueId(): string {
    if (
      this.numberOfGeneratedUniqueIds >= 1 &&
      this.allowMultipleUniqueIds === false
    ) {
      throw new ApiError({
        message: "Cannot generate more than one unique id for a single file",
        statusCode: 400,
      });
    }

    const generatedId = v4();

    this.numberOfGeneratedUniqueIds++;

    return generatedId;
  }

  validateFileTypeSupport(fileType: string): void {
    return GeneralUtils.validateFileTypeSupport(fileType);
  }

  async asPartsForAIClient(
    // @ts-ignore
    parsed: any
  ): Promise<string[]> {
    let asString: string = this.readFileAsString();

    // @ts-ignore
    let isHarming: boolean = await this.isHarming({
      fileContent: asString,
      throwIfHarming: true,
    });

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
}
