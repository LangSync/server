"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
exports.default = {
    port: process.env.PORT || 3000,
    cipherSecretKey: crypto_1.default.randomBytes(32),
    serverInitVector: crypto_1.default.randomBytes(16),
};
//# sourceMappingURL=server.js.map