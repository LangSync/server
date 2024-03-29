import fs from "fs";
import { v4 } from "uuid";
import { OpenAIClient } from "../../ai_clients/openAI";
import { LangSyncLogger } from "../../controllers/utils/logger";
import { loggingTypes } from "../../enum";
import { GeneralUtils } from "../../controllers/utils/general";
import { parsedFileContentPartsSeparatorForOpenAI } from "../../controllers/utils/partitions_splitter";
import { HarmOptions } from "../../type";
import { ApiError } from "../../controllers/utils/api_error";

interface CoreAdapterInterface {
  get aiClient(): OpenAIClient;
  isHarming(options: HarmOptions): Promise<boolean>;
  deleteFile(filePath: string): void;
  readFileAsString(filePath: string): string;
  generateUniqueId(): string;
  validateFileTypeSupport(fileType: string): void;
  ensureParsedIsValidObject(parsed: any): void;
}

export class CoreAdapter implements CoreAdapterInterface {
  filePath: string;

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

  deleteFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  readFileAsString(filePath: string): string {
    let asString: string = fs.readFileSync(filePath, "utf8");
    new LangSyncLogger().log({
      message: `File named ${filePath
        .split("/")
        .pop()} has been loaded as a string.`,
      type: loggingTypes.info,
    });

    return asString;
  }

  generateUniqueId(): string {
    const generatedId = v4();

    return generatedId;
  }

  validateFileTypeSupport(fileType: string): void {
    return GeneralUtils.validateFileTypeSupport(fileType);
  }

  async asPartsForAIClient(
    // @ts-ignore
    parsed: any,
    filePath: string
  ): Promise<string[]> {
    let asString: string = this.readFileAsString(filePath);

    // @ts-ignore
    let isHarming: boolean = await this.isHarming({
      fileContent: asString,
      throwIfHarming: true,
    });

    let asParts: string[] = await parsedFileContentPartsSeparatorForOpenAI(
      parsed
    );

    new LangSyncLogger().log({
      message: `File named ${filePath.split("/").pop()} has been split into ${
        asParts.length
      } parts.`,
      type: loggingTypes.info,
    });

    return asParts;
  }

  ensureParsedIsValidObject(
    // ensure that the parsed json id object of string-string pairs.
    parsed: any
  ): void {
    if (typeof parsed !== "object") {
      throw new ApiError({
        message: "The parsed json is not an object.",
        statusCode: 400,
      });
    }

    if (Array.isArray(parsed)) {
      throw new ApiError({
        message: "The parsed json is an array.",
        statusCode: 400,
      });
    }

    if (parsed === null) {
      throw new ApiError({
        message: "The parsed json is null.",
        statusCode: 400,
      });
    }

    if (Object.keys(parsed).length === 0) {
      throw new ApiError({
        message: "The parsed json is an empty object.",
        statusCode: 400,
      });
    }

    for (let key in parsed) {
      if (typeof key !== "string") {
        throw new ApiError({
          message: "The parsed json has a non-string key.",
          statusCode: 400,
        });
      }

      if (typeof parsed[key] !== "string") {
        throw new ApiError({
          message: "The parsed json has a non-string value.",
          statusCode: 400,
        });
      }
    }
  }
}
