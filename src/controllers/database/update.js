const client = require("./client");

module.exports = function update(databaseName, collectionName, filter, update) {
  return client
    .db(databaseName)
    .collection(collectionName)
    .updateOne(filter, update);
};
