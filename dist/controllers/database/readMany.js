"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./client"));
function readMany(databaseName, collectionName, 
// document,
aggregateQuery) {
    return client_1.default
        .db(databaseName)
        .collection(collectionName)
        .aggregate(aggregateQuery)
        .project({ _id: 0 })
        .toArray();
}
exports.default = readMany;
;
//# sourceMappingURL=readMany.js.map