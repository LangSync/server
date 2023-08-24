const client = require("./client");

export function insert(
    databaseName,
    collectionName,
    document
    ) {
    return client
        .db(databaseName)
        .collection(collectionName)
        .insertOne(document);
    }


 