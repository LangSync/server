import { BaseAdapterInterface } from "../base/interfaces/adapter";
import { CoreAdapter } from "../base/abstracts/core_adapter";

export class JsonAdapter extends CoreAdapter implements BaseAdapterInterface {
  adapterFileExtension: string = "json";

  parseStringToObject(filePath: string): any {
    let fileContent = this.readFileAsString(filePath);

    let parsed = JSON.parse(fileContent);
    this.ensureParsedIsValidObject(parsed);

    return parsed;
  }

  stringifyObjectToString(object: any): string {
    return JSON.stringify(object);
  }
}
