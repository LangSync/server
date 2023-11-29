import { MongoClient, ServerApiVersion } from "mongodb";
import dbConfig from "../../configs/db";
import { LangSyncLogger } from "../utils/logger";

export class LangSyncDatabaseClient {
  constructor() {}

  static _instance: LangSyncDatabaseClient = new LangSyncDatabaseClient();

  static get instance(): LangSyncDatabaseClient {
    return this._instance;
  }

  static client: MongoClient = new MongoClient(<string>dbConfig.uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  static async init(): Promise<void> {
    try {
      await this.client.connect();

      await this.client.db("admin").command({ ping: 1 });

      new LangSyncLogger().log({
        message: "Database connection established successfully.",
      });
    } catch (err) {
      console.dir(err);
    }
  }
}
