type ExtractedApiKey = string;

type HarmOptions = { fileContent: string; throwIfHarming: boolean };

type LogOptions = {
  message: string;
  type?: any;
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
  instruction?: string;
};

type LangTaskResult = {
  lang: string;
  localizedAt: string;
  allPartitionsPromise: () => Promise<any[]>;
};

type TranslationOptions = {
  partitions: any[];
  langs: string[];
  languageLocalizationMaxDelay: number;
  expressResponse: any;
  instruction?: string;
};

type PartitionsMessagesOptions = {
  partitions: any[];
  lang: string;
  instruction?: string;
};

type PromptOptions = {
  partition: any;
  lang: string;
  instruction?: string;
};
