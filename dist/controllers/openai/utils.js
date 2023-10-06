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
const openai_1 = require("openai");
const openai_2 = __importDefault(require("../../configs/openai"));
function canBeDecodedToJsonSafely(encapsulatedFieldsString) {
    try {
        let decoded = jsonFromEncapsulatedFields(encapsulatedFieldsString);
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
}
function jsonFromEncapsulatedFields(encapsulatedFieldsString) {
    let replacedSymbols = encapsulatedFieldsString
        .join("")
        .replaceAll("(", "")
        .replaceAll(")", "")
        .replaceAll(`\"`, `"`)
        .replaceAll("\n", "")
        .replaceAll('""', '"\n"');
    let asLines = replacedSymbols.split("\n");
    for (let index = 0; index < asLines.length - 1; index++) {
        asLines[index] = asLines[index] + ", ";
    }
    let asStringifedJson = "{" + asLines.join("\n") + "}";
    // console.log("\n\n asStringifedJson:       " + asStringifedJson + "\n\n");
    return JSON.parse(asStringifedJson);
}
function generateMessageToOpenAI(partition, lang) {
    return openai_2.default.jsonUserMessage(partition, lang);
}
function makeOpenAIRequest(messageToOpenAI) {
    return __awaiter(this, void 0, void 0, function* () {
        const openai = new openai_1.OpenAI({
            apiKey: openai_2.default.openAI,
        });
        try {
            let res = yield openai.chat.completions.create({
                model: openai_2.default.jsonOpenAIModel,
                messages: [
                    {
                        role: "system",
                        content: openai_2.default.jsonSystemMessage,
                    },
                    { role: "user", content: messageToOpenAI },
                ],
            });
            return res;
        }
        catch (error) {
            if (error.status === 429) {
                console.log("OpenAI API rate limit reached, waiting 20 seconds for next request");
                yield new Promise((resolve) => setTimeout(resolve, openai_2.default.delayForRateLimitNextRequestInSeconds * 1000));
                console.log("20 seconds passed, continuing request");
                return yield makeOpenAIRequest(messageToOpenAI);
            }
            else {
                throw error;
            }
        }
    });
}
exports.default = {
    canBeDecodedToJsonSafely: canBeDecodedToJsonSafely,
    jsonFromEncapsulatedFields: jsonFromEncapsulatedFields,
    generateMessageToOpenAI: generateMessageToOpenAI,
    makeOpenAIRequest: makeOpenAIRequest,
};
//# sourceMappingURL=utils.js.map