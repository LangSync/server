const client = require("./client");

export function read(databaseName, collectionName, document) {
  return client
    .db(databaseName)
    .collection(collectionName)

    .findOne(document);
}
