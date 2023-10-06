import { MongoClient, ServerApiVersion } from "mongodb";
import dbConfig from "../../configs/db";

const client = new MongoClient(dbConfig.uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export default  client;
