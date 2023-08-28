const client = require("./client");

module.exports = function read(databaseName, collectionName, document) {
  return client.db(databaseName).collection(collectionName).findOne(document);
};
