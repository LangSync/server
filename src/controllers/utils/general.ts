import { LangSyncLogger } from "./logger";
import { LangSyncAllowedFileTypes, loggingTypes } from "../../enum";
import { AdapterFromOptions, ExtractedApiKey, ValidAdapter } from "../../type";
import { ApiError } from "./api_error";
import { JsonAdapter } from "../../adapters/json";
import YamlAdapter from "../../adapters/yaml";

export class GeneralUtils {
  static getFileExtension(filePath: string): string {
    let splitByDot = filePath.split(".");

    return splitByDot[splitByDot.length - 1];
  }

  static from(options: AdapterFromOptions): ValidAdapter {
    let adapter: ValidAdapter;

    switch (options.adapterFileExtension) {
      case new JsonAdapter().adapterFileExtension:
        adapter = new JsonAdapter();
        break;
      case new YamlAdapter().adapterFileExtension:
        adapter = new YamlAdapter();
        break;
    }

    if (!adapter) {
      console.error(options.adapterFileExtension);

      throw new ApiError({
        message: "File type not supported.",
        statusCode: 400,
      });
    } else {
      new LangSyncLogger().log({
        message: "Triggered Adapter Type: " + adapter.constructor.name,
      });

      return adapter;
    }
  }

  static canBeDecodedAsObject(contents: string[]): boolean {
    try {
      this.ObjectFromEncapsulatedFields(contents);

      return true;
    } catch (error: Error | any) {
      new LangSyncLogger().log({
        message: error,
        type: loggingTypes.error,
      });

      return false;
    }
  }

  static ObjectFromEncapsulatedFields(contents: string[]) {
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
