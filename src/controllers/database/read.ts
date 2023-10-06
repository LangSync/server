import client from "./client";

export default function read(databaseName, collectionName, document) {
  return client.db(databaseName).collection(collectionName).findOne(document);
};
