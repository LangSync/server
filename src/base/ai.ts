interface ArtificialIntelligenceBase {
  init(apiKey: string): void;
  isHarming(content: string): Promise<boolean>;
}
