import { loggingTypes } from "../../enum";
import { LogOptions } from "../../type";

interface LoggerBase {
  log(options: LogOptions): void;
}

export class LangSyncLogger implements LoggerBase {
  log(options: LogOptions): void {
    switch (options.type) {
      case loggingTypes.info:
        console.log(options.message);
        break;
      case loggingTypes.error:
        console.error(options.message);
        break;
      case loggingTypes.warning:
        console.warn(options.message);
        break;
      case loggingTypes.debug:
        console.debug(options.message);
        break;
      default:
        console.log(options.message);
        break;
    }
  }
}
