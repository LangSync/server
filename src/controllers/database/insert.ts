import { LangSyncDatabaseClient } from "./client";

export class LangSyncDatabaseInsert {
  async cliException(value: any) {
    return await this.insert("db", "cli_exceptions", value);
  }
  constructor() {}

  async fileOperation(doc: {
    userId: any;
    operationId: string;
    createdAt: string;
    jsonAsParts: string[];
    adapterFileExtension: string;
  }): Promise<any> {
    return await this.insert("db", "jsonPartitions", doc);
  }

  async insert(databaseName: string, collectionName: string, document: any) {
    return LangSyncDatabaseClient.client
      .db(databaseName)
      .collection(collectionName)
      .insertOne(document);
  }
}
