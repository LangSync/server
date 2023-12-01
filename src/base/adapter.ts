interface BaseAdapter {
  get aiClient(): ArtificialIntelligenceBase;
  deleteFile(): void;
  readFileAsString(): string;
  parseString(fileContent: string): void;
  isHarming(options: HarmOptions): Promise<boolean>;
  asPartsForOpenAI(): Promise<string[]>;
  generateUniqueId(): string;
  validateFileTypeSupport(fileType: string): void;
  ensureParsedIsValidObject(parsed: any): void;
}
