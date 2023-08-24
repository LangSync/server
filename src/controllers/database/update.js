const client = require("./client");

export function update(
    databaseName,
    collectionName,
    filter,
    update
    ) {
    return client
        .db(databaseName)
        .collection(collectionName)
        .updateOne(filter, update);
    }