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
const read_1 = __importDefault(require("../database/read"));
const update_1 = __importDefault(require("../database/update"));
const joi_1 = __importDefault(require("joi"));
const utils_1 = __importDefault(require("../../controllers/openai/utils"));
function sseEvent(message, type, statusCode) {
    let types = ["warn", "info", "error"];
    if (!types.includes(type)) {
        type = "info";
    }
    let obj = {
        message: message,
        type: type,
        date: new Date().toISOString(),
        statusCode: statusCode,
    };
    return JSON.stringify(obj);
}
function resolveAllLangsLangsPromises(langsPromises) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = [];
        for (let index = 0; index < langsPromises.length; index++) {
            let curr = langsPromises[index];
            let allPartitionsPromiseResult = yield curr.allPartitionsPromise();
            let asContents = allPartitionsPromiseResult.map((p) => p.choices[0].message.content);
            let newLangObject = Object.assign(Object.assign({}, curr), { rawRResultResponse: asContents, jsonDecodedResponse: utils_1.default.canBeDecodedToJsonSafely(asContents)
                    ? utils_1.default.jsonFromEncapsulatedFields(asContents)
                    : { error: "the output of this partition can't be decoded to JSON" } });
            delete newLangObject.allPartitionsPromise;
            result.push(newLangObject);
        }
        return result;
    });
}
function openAIRequestsFrom(openAIMessages) {
    return openAIMessages.map((messageToOpenAI) => () => utils_1.default.makeOpenAIRequest(messageToOpenAI));
}
function requestMessagesForOpenAI(partitions, lang) {
    let result = [];
    for (let index = 0; index < partitions.length; index++) {
        console.log(`Translating partition ${index + 1}..`);
        const currentPartition = partitions[index];
        let messageToOpenAI = utils_1.default.generateMessageToOpenAI(currentPartition, lang);
        result.push(messageToOpenAI);
    }
    return result;
}
function _handlePartitionsTranslations(partitions, langs) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Starting to translate ${partitions.length} partitions found.`);
        let resultTranslationsBeforePromiseResolve = [];
        for (let indexLang = 0; indexLang < langs.length; indexLang++) {
            let currentLang = langs[indexLang];
            console.log(`Translating to ${currentLang}..`);
            let openAIMessages = requestMessagesForOpenAI(partitions, currentLang);
            let promises = openAIRequestsFrom(openAIMessages);
            let langAllPartitionsPromise = () => Promise.all(promises.map((p) => p()));
            resultTranslationsBeforePromiseResolve.push({
                lang: currentLang,
                localizedAt: new Date().toISOString(),
                allPartitionsPromise: langAllPartitionsPromise,
            });
        }
        let resultTranslationsAfterPrmiseResolve = yield resolveAllLangsLangsPromises(resultTranslationsBeforePromiseResolve);
        return resultTranslationsAfterPrmiseResolve;
    });
}
function processTranslations(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let apiKey = req.headers.authorization.split(" ")[1];
        if (!apiKey) {
            // send sse event.
            res.write(sseEvent("No API key provided.", "error", 401));
            return res.end();
        }
        let schema = joi_1.default.object({
            jsonPartitionsId: joi_1.default.string().min(2).required(),
            langs: joi_1.default.array().items(joi_1.default.string().min(2)).required(),
            includeOutput: joi_1.default.boolean().required(),
        });
        let { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error });
        }
        try {
            const { jsonPartitionsId, langs, includeOutput } = value;
            const userDocFIlter = {
                apiKeys: {
                    $elemMatch: {
                        apiKey: apiKey,
                    },
                },
            };
            console.log("using API key to see if it exists for any user..");
            let userDoc = yield (0, read_1.default)("db", "users", userDocFIlter);
            if (!userDoc) {
                console.log("invalid API key, no user found.");
                return res.status(401).json({ message: "Invalid API key." });
            }
            else {
                console.log("user with API key found.");
            }
            const filterDoc = {
                partitionId: jsonPartitionsId,
            };
            console.log("retrieving partitions doc with partition id.");
            const partitionsDoc = yield (0, read_1.default)("db", "jsonPartitions", filterDoc);
            if (!partitionsDoc) {
                return res.status(404).json({ message: "Partitions not found." });
            }
            let partitions = partitionsDoc.jsonAsParts;
            let resultTranslations = yield _handlePartitionsTranslations(partitions, langs);
            console.log("updating partitions doc with translations..");
            //
            yield (0, update_1.default)("db", "jsonPartitions", filterDoc, {
                $addToSet: {
                    output: {
                        $each: resultTranslations,
                    },
                },
            });
            console.log("partitions doc updated.");
            let response = {
                partitionId: jsonPartitionsId,
            };
            if (includeOutput) {
                console.log("including output in response..");
                response.output = resultTranslations;
            }
            console.log(response);
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}
exports.default = processTranslations;
;
//# sourceMappingURL=process_translations.js.map