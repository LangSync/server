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
const json_tiktoken_separator_1 = __importDefault(require("../utils/json_tiktoken_separator"));
const insert_1 = __importDefault(require("../database/insert"));
const read_1 = __importDefault(require("../database/read"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const openai_1 = __importDefault(require("../../configs/openai"));
const openai_2 = require("openai");
function _isHarmingOpenAIPolicy(messageToOpenAI) {
    return __awaiter(this, void 0, void 0, function* () {
        let openai = new openai_2.OpenAI({
            apiKey: openai_1.default.openAI,
        });
        try {
            console.log("starting moderation request");
            let moderationsRes = yield openai.moderations.create({
                input: messageToOpenAI.toString(),
            });
            console.log("moderation request finished");
            return typeof moderationsRes.results[0].flagged === "boolean"
                ? moderationsRes.results[0].flagged
                : false;
        }
        catch (error) {
            if (error.status === 429) {
                console.log("OpenAI API rate limit reached, waiting 20 seconds for next moderation request");
                yield new Promise((resolve) => setTimeout(resolve, openai_1.default.delayForRateLimitNextRequestInSeconds * 1000));
                console.log("20 seconds passed, continuing request");
                return yield _isHarmingOpenAIPolicy(messageToOpenAI);
            }
            else {
                throw error;
            }
        }
    });
}
function save_partitioned_json_of_user(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const filePath = req.file.path;
            const uploadedJsonFile = fs_1.default.readFileSync(filePath, "utf8");
            let apiKey = req.headers.authorization.split(" ")[1];
            let isHarming = yield _isHarmingOpenAIPolicy(uploadedJsonFile);
            if (isHarming) {
                console.log("The provided content violates our policy, and so it is unacceptable to be processed.");
                return res.status(400).json({
                    message: "The provided content violates our policy, and so it is unacceptable to be processed.",
                });
            }
            else {
                console.log("The provided content is acceptable to be processed.");
            }
            const parsedJson = JSON.parse(uploadedJsonFile);
            const jsonAsParts = (0, json_tiktoken_separator_1.default)(parsedJson);
            const idForThisPartitionedJson = (0, uuid_1.v4)();
            let userDocFilter = {
                apiKeys: {
                    $elemMatch: {
                        apiKey: apiKey,
                    },
                },
            };
            let userDoc = yield (0, read_1.default)("db", "users", userDocFilter);
            let userId = userDoc.userId;
            const doc = {
                userId: userId,
                jsonAsParts: jsonAsParts,
                createdAt: new Date().toISOString(),
                partitionId: idForThisPartitionedJson,
            };
            yield (0, insert_1.default)("db", "jsonPartitions", doc);
            fs_1.default.unlinkSync(filePath);
            res.status(200).json({
                message: "Successfully saved partitioned json",
                partitionId: idForThisPartitionedJson,
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ message: "Internal server error", error: error });
        }
    });
}
exports.default = save_partitioned_json_of_user;
//# sourceMappingURL=save_partitioned_json_of_user.js.map