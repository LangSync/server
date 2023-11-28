import { LangSyncDatabaseDelete } from "./delete";
import { LangSyncDatabaseInsert } from "./insert";
import { LangSyncDatabaseRead } from "./read";
import { LangSyncDatabaseUpdate } from "./update";

export class LangSyncDatabase implements LangSyncDatabaseBase {
  constructor() {}

  static _instance: LangSyncDatabase = new LangSyncDatabase();

  read = new LangSyncDatabaseRead();
  insert = new LangSyncDatabaseInsert();
  update = new LangSyncDatabaseUpdate();
  delete = new LangSyncDatabaseDelete();

  static get instance(): LangSyncDatabase {
    return this._instance;
  }
}
