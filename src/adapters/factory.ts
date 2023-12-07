import { ApiError } from "../controllers/utils/api_error";
import { LangSyncLogger } from "../controllers/utils/logger";
import { AdapterFromOptions, ValidAdapter } from "../type";
import { JsonAdapter } from "./json";
import YamlAdapter from "./yaml";

export class AdapterFactory {
  static _instance = new AdapterFactory();

  static get instance() {
    return this._instance;
  }

  from(options: AdapterFromOptions): ValidAdapter {
    let possibleAdapter: ValidAdapter =
      this.registry[options.adapterFileExtension];

    if (!possibleAdapter) {
      throw new ApiError({
        message: "File type not supported.",
        statusCode: 400,
      });
    } else {
      new LangSyncLogger().log({
        message: "Triggered Adapter Type: " + possibleAdapter.constructor.name,
      });

      return possibleAdapter;
    }
  }

  private adapters: ValidAdapter[] = [new JsonAdapter(), new YamlAdapter()];

  private registry = this.adapters.reduce((acc, adapter: ValidAdapter) => {
    acc[adapter.adapterFileExtension] = adapter;
    return acc;
  }, {} as Record<string, ValidAdapter>);
}
