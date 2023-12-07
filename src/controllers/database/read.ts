import { Document, Filter } from "mongodb";
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

  async userOperations(operationId: string): Promise<any[]> {
    let docFilter = {
      operationId: operationId,
    };

    let projection = {
      _id: 1,
      output: {
        $map: {
          input: "$output",
          as: "output",
          in: {
            // show only the "lang" field of the item.
            lang: "$$output.lang",
            localizedAt: "$$output.localizedAt",
            objectDecodedResponse: "$$output.objectDecodedResponse",
            adaptedResponse: "$$output.adaptedResponse",
          },
        },
      },
    };

    let aggregateQuery = [
      {
        $match: docFilter,
      },
      {
        $project: projection,
      },
    ];

    let docs = this.readMany("db", "jsonPartitions", aggregateQuery);

    return docs;
  }

  async read(
    databaseName: string,
    collectionName: string,
    document: Filter<Document | any>
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
