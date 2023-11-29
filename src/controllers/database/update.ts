import { Document, Filter, UpdateFilter } from "mongodb";
import { LangSyncDatabaseClient } from "./client";

export class LangSyncDatabaseUpdate {
  constructor() {}

  updateOperationDoc(
    operationId: string,
    resultTranslations: any[]
  ): Promise<any> {
    const filterDoc = {
      operationId: operationId,
    };
    return this.update("db", "jsonPartitions", filterDoc, {
      $addToSet: {
        //@ts-ignore
        output: {
          $each: resultTranslations,
        },
      },
    });
  }
  update(
    databaseName: string,
    collectionName: string,
    filter: Filter<Document | any>,
    update: UpdateFilter<Document>
  ) {
    return LangSyncDatabaseClient.client
      .db(databaseName)
      .collection(collectionName)
      .updateOne(filter, update);
  }
}
