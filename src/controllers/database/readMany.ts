import client from "./client";

export default function readMany(
  databaseName,
  collectionName,
  // document,
  aggregateQuery
) {
  return client
    .db(databaseName)
    .collection(collectionName)
    .aggregate(aggregateQuery)
    .project({ _id: 0 })
    .toArray();
};
