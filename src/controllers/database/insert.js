const client = require("./client");

module.exports =  function insert(
    databaseName,
    collectionName,
    document
    ) {
    return client
        .db(databaseName)
        .collection(collectionName)
        .insertOne(document);
    }


 