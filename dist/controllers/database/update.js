"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./client"));
function update(databaseName, collectionName, filter, update) {
    return client_1.default
        .db(databaseName)
        .collection(collectionName)
        .updateOne(filter, update);
}
exports.default = update;
;
//# sourceMappingURL=update.js.map