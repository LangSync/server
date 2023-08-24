const client = require("./client");

export function deleteOne(databaseName, collectionName, document) {
  return client.db(databaseName).collection(collectionName).deleteOne(document);
}
