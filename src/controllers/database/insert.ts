import { LangSyncDatabaseClient } from "./client";
import { LangSyncDatabase } from "./database";

export class LangSyncDatabaseInsert {
  async cliException(value: any) {
    return await this.insert("db", "cli_exceptions", value);
  }
  constructor() {}
  _instance: LangSyncDatabaseInsert = new LangSyncDatabaseInsert();

  get instance(): LangSyncDatabaseInsert {
    return this._instance;
  }

  async fileOperation(doc: {
    userId: any;
    operationId: string;
    createdAt: string;
    jsonAsParts: Promise<string[]>;
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
