"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOne = void 0;
const client_1 = __importDefault(require("./client"));
function deleteOne(databaseName, collectionName, document) {
    return client_1.default.db(databaseName).collection(collectionName).deleteOne(document);
}
exports.deleteOne = deleteOne;
//# sourceMappingURL=delete.js.map