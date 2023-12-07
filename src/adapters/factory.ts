import { ApiError } from "../controllers/utils/api_error";
import { LangSyncLogger } from "../controllers/utils/logger";
import { LangSyncAllowedFileTypes } from "../enum";
import { AdapterFromOptions, ValidAdapter } from "../type";
import { JsonAdapter } from "./json";
import YamlAdapter from "./yaml";

export class AdapterFactory {
  private static _instance = new AdapterFactory();

  private constructor() {
    this.ensureAdapters();
  }

  public static get instance() {
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

  ensureAdapters(): void {
    let allowedFileTypeEnumEntries = Object.entries(LangSyncAllowedFileTypes);

    if (this.adapters.length != allowedFileTypeEnumEntries.length) {
      throw new Error(
        "Adapter Factory not properly initialized. Please check the allowed file types enum and the adapters array in the factory."
      );
    }
  }
}
