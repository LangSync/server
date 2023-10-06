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
function createNewApiKeyBasedOnUserAuthToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let schema = joi_1.default.object({
            userId: joi_1.default.string().min(2).required(),
        });
        let { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error });
        }
        try {
            let apiKey = crypto_1.default
                .createHmac("sha256", server_1.default.cipherSecretKey)
                .update(value.userId + "-" + new Date().getTime())
                .digest("hex");
            let apiKeyItem = {
                $currentDate: {
                    date: { $type: "date" },
                },
                apiKey: apiKey,
            };
            let filterDoc = {
                userId: value.userId,
            };
            let updateDoc = {
                $push: {
                    apiKeys: apiKeyItem,
                },
            };
            yield (0, update_1.default)("db", "users", filterDoc, updateDoc);
            res.status(201).json({
                message: "New API key created & saved successfully",
                apiKey: apiKey,
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    });
}
exports.default = createNewApiKeyBasedOnUserAuthToken;
;
//# sourceMappingURL=create_new_api_key_based_on_user_auth_token.js.map