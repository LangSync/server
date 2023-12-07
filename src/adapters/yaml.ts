import CoreAdapter from "../base/abstracts/core_adapter";
import { BaseAdapterInterface } from "../base/interfaces/adapter";
import Yaml from "yaml";

export class YamlAdapter extends CoreAdapter implements BaseAdapterInterface {
  constructor(filePath: string) {
    super(filePath);
  }

  parseStringToObject(): void {
    let fileContent = this.readFileAsString();

    let parsed = Yaml.parse(fileContent);
    this.ensureParsedIsValidObject(parsed);

    return parsed;
  }
}
