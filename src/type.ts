type ExtractedApiKey = string;

type HarmOptions = { fileContent: string; throwIfHarming: boolean };

type LogOptions = {
  message: string;
  type?: loggingTypes;
  data?: any;
};

type SseEvent = {
  message: string;
  type: string;
  statusCode: number;
};

type SseResponseEvent = {
  message: string;
  type: string;
  statusCode: number;
  date: string;
};

type LocalizationProcessorOptions = {
  index: number;
  lang: string;
  partitions: any[];
};

type LangTaskOptions = {
  partitions: any[];
  currentLang: string;
};

type LangTaskResult = {
  lang: string;
  localizedAt: string;

  allPartitionsPromise: () => Promise<any[]>;
};
