import { Filter } from "mongodb";
import { LangSyncDatabaseClient } from "./client";

export class LangSyncDatabaseDelete {
  constructor() {}

  _instance: LangSyncDatabaseDelete = new LangSyncDatabaseDelete();

  get instance(): LangSyncDatabaseDelete {
    return this._instance;
  }

  delete(
    databaseName: string,
    collectionName: string,
    document: Filter<Document>
  ) {
    return LangSyncDatabaseClient.client
      .db(databaseName)
      .collection(collectionName)
      .deleteOne(document);
  }
}
