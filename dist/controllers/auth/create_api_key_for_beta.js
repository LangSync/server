"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("../../configs/server"));
const crypto_1 = __importDefault(require("crypto"));
const joi_1 = __importDefault(require("joi"));
const update_1 = __importDefault(require("../database/update"));
const read_1 = __importDefault(require("../database/read"));
const insert_1 = __importDefault(require("../database/insert"));
const uuid_1 = __importDefault(require("uuid"));
function createBetaUserAccountWithApiKey(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let schema = joi_1.default.object({
            username: joi_1.default.string().min(2).required(),
        });
        let { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error });
        }
        try {
            let apiKey = crypto_1.default
                .createHmac("sha256", server_1.default.cipherSecretKey)
                .update(value.username + "-" + new Date().getTime())
                .digest("hex");
            let apiKeyItem = {
                $currentDate: {
                    date: { $type: "date" },
                },
                apiKey: apiKey,
            };
            let filterDoc = {
                username: value.username,
            };
            let userDoc = yield (0, read_1.default)("db", "users", filterDoc);
            if (!userDoc) {
                let createdUserDoc = yield (0, insert_1.default)("db", "users", {
                    username: value.username,
                    userId: uuid_1.default.v4(),
                    createdAt: new Date(),
                });
            }
            let updateDoc = {
                $push: {
                    apiKeys: apiKeyItem,
                },
            };
            yield (0, update_1.default)("db", "users", filterDoc, updateDoc);
            res.status(201).json({
                message: "New API key created & saved successfully",
                username: value.username,
                apiKey: apiKey,
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    });
}
exports.default = createBetaUserAccountWithApiKey;
;
//# sourceMappingURL=create_api_key_for_beta.js.map