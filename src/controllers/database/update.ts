import client from "./client";

export default function update(databaseName, collectionName, filter, update) {
  return client
    .db(databaseName)
    .collection(collectionName)
    .updateOne(filter, update);
};
