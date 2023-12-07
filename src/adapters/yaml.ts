import Yaml from "yaml";
import { BaseAdapterInterface } from "../base/interfaces/adapter";
import { CoreAdapter } from "../base/abstracts/core_adapter";

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
