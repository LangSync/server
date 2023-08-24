const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient(dbConfig.uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

module.exports = client;