import { Filter, UpdateFilter } from "mongodb";
import { LangSyncDatabaseClient } from "./client";

export class LangSyncDatabaseUpdate {
  constructor() {}

  static _instance: LangSyncDatabaseUpdate = new LangSyncDatabaseUpdate();

  static get instance(): LangSyncDatabaseUpdate {
    return this._instance;
  }

  updateOperationDoc(
    operationId: string,
    resultTranslations: any[]
  ): Promise<any> {
    const filterDoc = {
      operationId: operationId,
    };

    return this.update("db", "jsonPartitions", filterDoc, {
      $addToSet: {
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
