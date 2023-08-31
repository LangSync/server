const client = require("./client");

module.exports = function readMany(
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
