import client from "./client";

export default function insert(databaseName, collectionName, document) {
  return client.db(databaseName).collection(collectionName).insertOne(document);
};
