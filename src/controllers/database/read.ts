import { Document, Filter } from "mongodb";
import { LangSyncDatabaseClient } from "./client";

export class LangSyncDatabaseRead {
  async userDocByEmail(email: any) {
    let userDocFilter = {
      email: email,
    };

    let projection = {
      _id: 0,
      email: 1,
      username: 1,
      userId: 1,
      createdAt: 1,
      apiKeys: {
        $map: {
          input: "$apiKeys",
          as: "apiKey",
          in: {
            apiKey: "$$apiKey.apiKey",
          },
        },
      },
    };

    let aggregateQuery = [
      {
        $match: userDocFilter,
      },
      {
        $project: projection,
      },
    ];

    let docs = await this.readMany("db", "users", aggregateQuery);

    return docs[0] || null;
  }

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
