import { type OpenAIClient } from "../../ai_clients/openAI";

export interface BaseAdapterInterface {
  parseString(fileContent: string): void;
  ensureParsedIsValidObject(parsed: any): void;
}

export interface CoreAdapterInterface {
  get aiClient(): OpenAIClient;
  isHarming(options: HarmOptions): Promise<boolean>;
  deleteFile(): void;
  readFileAsString(): string;
  generateUniqueId(): string;
  validateFileTypeSupport(fileType: string): void;
}
