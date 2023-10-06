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
const joi_1 = __importDefault(require("joi"));
const read_1 = __importDefault(require("../database/read"));
function verifyApiKeyWithUserAuthToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let schema = joi_1.default.object({
            apiKey: joi_1.default.string().min(2).required(),
            userAuthToken: joi_1.default.string().min(2).required(),
        });
        let { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error });
        }
        const { apiKey, userAuthToken } = value;
        try {
            let document = yield (0, read_1.default)("db", "users", {
                userAuthToken: userAuthToken,
            });
            if (!document) {
                return res.status(401).json({
                    message: "Invalid User Auth Token",
                });
            }
            let apiKeyFromDocument = document.apiKeys.find((item) => item.apiKey === apiKey);
            if (!apiKeyFromDocument) {
                return res.status(401).json({
                    message: "Invalid API key",
                });
            }
            else {
                return res.status(200).json({
                    message: "API key is valid",
                });
            }
        }
        catch (error) {
            res.status(401).json({
                message: "Invalid API key",
            });
        }
    });
}
exports.default = verifyApiKeyWithUserAuthToken;
;
//# sourceMappingURL=validate_api_key_with_user_token.js.map