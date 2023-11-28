import { Filter, WithId } from "mongodb";
import { LangSyncDatabaseClient } from "./client";

export class LangSyncDatabaseRead {
  async userDocByApiKey(apiKey: string): Promise<any> {
    let userDocFilter = {
      apiKeys: {
        $elemMatch: {
          apiKey: apiKey,
        },
      },
    };

    return await this.read("db", "users", userDocFilter);
  }

  async savedFileByOperationId(operationId: string) {
    const filterDoc = {
      operationId: operationId,
    };

    return this.read("db", "jsonPartitions", filterDoc);
  }

  constructor() {}

  _instance: LangSyncDatabaseRead = new LangSyncDatabaseRead();

  get instance(): LangSyncDatabaseRead {
    return this._instance;
  }

  async read(
    databaseName: string,
    collectionName: string,
    document: Filter<Document>
  ) {
    return LangSyncDatabaseClient.client
      .db(databaseName)
      .collection(collectionName)
      .findOne(document);
  }

  readMany(databaseName: string, collectionName: string, aggregateQuery: any) {
    return LangSyncDatabaseClient.client
      .db(databaseName)
      .collection(collectionName)
      .aggregate(aggregateQuery)
      .project({ _id: 0 })
      .toArray();
  }
}
