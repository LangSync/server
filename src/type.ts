import { JsonAdapter } from "./adapters/json";
import { type YamlAdapter } from "./adapters/yaml";

export type ExtractedApiKey = string;

export type HarmOptions = { fileContent: string; throwIfHarming: boolean };

export type LogOptions = {
  message: string;
  type?: any;
  data?: any;
};

export type SseEvent = {
  message: string;
  type: string;
  statusCode: number;
};

export type SseResponseEvent = {
  message: string;
  type: string;
  statusCode: number;
  date: string;
};

export type LocalizationProcessorOptions = {
  index: number;
  lang: string;
  partitions: any[];
};

export type LangTaskOptions = {
  partitions: any[];
  currentLang: string;
  instruction?: string;
};

export type LangTaskResult = {
  lang: string;
  localizedAt: string;
  allPartitionsPromise: () => Promise<any[]>;
};

export type TranslationOptions = {
  partitions: any[];
  langs: string[];
  languageLocalizationMaxDelay: number;
  expressResponse: any;
  instruction?: string;
};

export type PartitionsMessagesOptions = {
  partitions: any[];
  lang: string;
  instruction?: string;
};

export type PromptOptions = {
  partition: any;
  lang: string;
  instruction?: string;
};

export type AdapterFromOptions = {
  fileType: string;
  filePath: string;
};

export type ValidAdapter = JsonAdapter | YamlAdapter;
