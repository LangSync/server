import { BaseAdapterInterface } from "../base/interfaces/adapter";
import CoreAdapter from "../base/abstracts/core_adapter";

export class JsonAdapter extends CoreAdapter implements BaseAdapterInterface {
  constructor(filePath: string) {
    super(filePath);
  }

  parseStringToObject(): any {
    let fileContent = this.readFileAsString();

    let parsed = JSON.parse(fileContent);
    this.ensureParsedIsValidObject(parsed);

    return parsed;
  }
}
