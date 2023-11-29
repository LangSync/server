import { Document, Filter } from "mongodb";
import { LangSyncDatabaseClient } from "./client";

export class LangSyncDatabaseDelete {
  constructor() {}

  delete(
    databaseName: string,
    collectionName: string,
    document: Filter<Document | any>
  ) {
    return LangSyncDatabaseClient.client
      .db(databaseName)
      .collection(collectionName)
      .deleteOne(document);
  }
}
