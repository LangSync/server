import { BaseAdapterInterface } from "../base/interfaces/adapter";
import { CoreAdapter } from "../base/abstracts/core_adapter";

export class JsonAdapter extends CoreAdapter implements BaseAdapterInterface {
  constructor(filePath: string) {
    super(filePath);
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

  parseString(): any {
    let fileContent = this.readFileAsString();

    let parsed = JSON.parse(fileContent);
    this.ensureParsedIsValidObject(parsed);

    return parsed;
  }
}
