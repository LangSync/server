import { type OpenAIClient } from "../../ai_clients/openAI";
import { type HarmOptions } from "../../type";

export interface BaseAdapterInterface {
  parseStringToObject(fileContent: string): void;
}

export interface CoreAdapterInterface {
  get aiClient(): OpenAIClient;
  isHarming(options: HarmOptions): Promise<boolean>;
  deleteFile(): void;
  readFileAsString(): string;
  generateUniqueId(): string;
  validateFileTypeSupport(fileType: string): void;
  ensureParsedIsValidObject(parsed: any): void;
}
