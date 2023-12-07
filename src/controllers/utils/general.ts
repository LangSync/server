import { LangSyncLogger } from "./logger";
import { LangSyncAllowedFileTypes, loggingTypes } from "../../enum";
import { AdapterFromOptions, ExtractedApiKey, ValidAdapter } from "../../type";
import { ApiError } from "./api_error";
import { JsonAdapter } from "../../adapters/json";
import { YamlAdapter } from "../../adapters/yaml";

export class GeneralUtils {
  static from(options: AdapterFromOptions): ValidAdapter {
    switch (options.fileType) {
      case "json":
        return new JsonAdapter(options.filePath);
      case "yaml":
        return new YamlAdapter(options.filePath);
      default:
        throw new ApiError({
          message: "Unsupported file type",
          statusCode: 400,
        });
    }
  }

  static canBeDecodedToJsonSafely(contents: string[]): boolean {
    try {
      this.jsonFromEncapsulatedFields(contents);

      return true;
    } catch (error: Error | any) {
      new LangSyncLogger().log({
        message: error,
        type: loggingTypes.error,
      });

      return false;
    }
  }

  static jsonFromEncapsulatedFields(contents: string[]) {
    let replacedSymbols: string = contents
      .join("")
      .replaceAll("(", "")
      .replaceAll(")", "")
      .replaceAll(`\"`, `"`)
      .replaceAll("\n", "")
      .replaceAll('""', '"\n"');

    let asLines: string[] = replacedSymbols.split("\n");

    for (let index = 0; index < asLines.length - 1; index++) {
      asLines[index] = asLines[index] + ", ";
    }

    let asStringifedJson: string = "{" + asLines.join("\n") + "}";

    return JSON.parse(asStringifedJson);
  }

  static getFilePath(path: string): string {
    return path;
  }

  static extractApiKeyFromAuthorizationHeader(
    authorizationHeader: string
  ): ExtractedApiKey {
    return authorizationHeader.split(" ")[1];
  }

  static validateFileTypeSupport(fileType: string): void {
    let exists: boolean = Object.keys(LangSyncAllowedFileTypes).includes(
      fileType
    );

    if (!exists) {
      throw new ApiError({
        message: "File type not supported.",
        statusCode: 400,
      });
    } else {
      new LangSyncLogger().log({
        message: `File type ${fileType} is supported.`,
        type: loggingTypes.info,
      });
    }
  }

  static delay(seconds: number) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
}
