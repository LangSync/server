import { CoreAdapter } from "../base/abstracts/core_adapter";
import { BaseAdapterInterface } from "../base/interfaces/adapter";

export class YamlAdapter extends CoreAdapter implements BaseAdapterInterface {
  constructor(filePath: string) {
    super(filePath);
  }

  parseString(fileContent: string): void {
    throw new Error("Method not implemented.");
  }

  ensureParsedIsValidObject(parsed: any): void {
    throw new Error("Method not implemented.");
  }
}
