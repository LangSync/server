// import { type OpenAIClient } from "../../ai_clients/openAI";
// import { type HarmOptions } from "../../type";

export interface BaseAdapterInterface {
  parseStringToObject(fileContent: string): void;
}
