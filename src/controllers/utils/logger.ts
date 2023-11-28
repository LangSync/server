interface LoggerBase {
    log(options: LogOptions): void;
}

class LangSyncLogger implements LoggerBase {
    private static _instance: LangSyncLogger = new LangSyncLogger();

    static get instance(): LangSyncLogger {
        return LangSyncLogger._instance;
    }

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
