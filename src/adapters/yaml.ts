import Yaml from "yaml";
import { BaseAdapterInterface } from "../base/interfaces/adapter";
import { CoreAdapter } from "../base/abstracts/core_adapter";

export default class YamlAdapter
  extends CoreAdapter
  implements BaseAdapterInterface
{
  adapterFileExtension: string = "yaml";

  parseStringToObject(filePath: string): void {
    let fileContent = this.readFileAsString(filePath);

    let parsed = Yaml.parse(fileContent);

    this.ensureParsedIsValidObject(parsed);

    return parsed;
  }

  stringifyObjectToString(object: any): string {
    return Yaml.stringify(object);
  }
}
