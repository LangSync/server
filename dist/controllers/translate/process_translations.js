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
    let types = ["warn", "info", "error", "result"];
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
function resolveAllLangsLangsPromises(langsPromises, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = [];
        for (let index = 0; index < langsPromises.length; index++) {
            let curr = langsPromises[index];
            res.write(sseEvent(`\n${curr.lang} (${index + 1}/${langsPromises.length}):`, "info", 200));
            res.write(sseEvent(`Starting localazing..`, "info", 200));
            let allPartitionsPromiseResult = yield curr.allPartitionsPromise();
            res.write(sseEvent(`Partition localized successfully, starting to decode the output of the ${curr.lang} language..`, "info", 200));
            let asContents = allPartitionsPromiseResult.map((p) => p.choices[0].message.content);
            let newLangObject = Object.assign(Object.assign({}, curr), { rawRResultResponse: asContents, jsonDecodedResponse: utils_1.default.canBeDecodedToJsonSafely(asContents)
                    ? utils_1.default.jsonFromEncapsulatedFields(asContents)
                    : {
                        langsyncError: "the output of this partition can't be decoded to JSON",
                    } });
            delete newLangObject.allPartitionsPromise;
            res.write(sseEvent(`Decoded the output of the ${curr.lang} language successfully, continuing..`, "info", 200));
            result.push(newLangObject);
        }
        res.write(sseEvent(`\nFinished localizing your input file to all target languages, continuing..\n`, "info", 200));
        return result;
    });
}
function openAIRequestsFrom(openAIMessages) {
    return openAIMessages.map((messageToOpenAI) => () => utils_1.default.makeOpenAIRequest(messageToOpenAI));
}
function requestMessagesForOpenAI(partitions, lang) {
    let result = [];
    for (let index = 0; index < partitions.length; index++) {
        const currentPartition = partitions[index];
        let messageToOpenAI = utils_1.default.generateMessageToOpenAI(currentPartition, lang);
        result.push(messageToOpenAI);
    }
    return result;
}
function _handlePartitionsTranslations(partitions, langs, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.write(sseEvent(`Starting to localize ${partitions.length} partitions found from your input file to target languages: ${langs.join(", ")}\n`, "info", 200));
        let resultTranslationsBeforePromiseResolve = [];
        for (let indexLang = 0; indexLang < langs.length; indexLang++) {
            let currentLang = langs[indexLang];
            res.write(sseEvent(`Scheduling the ${currentLang} language localization task. (lang ${indexLang + 1}/${langs.length})`, "info", 200));
            let openAIMessages = requestMessagesForOpenAI(partitions, currentLang);
            let promises = openAIRequestsFrom(openAIMessages);
            let langAllPartitionsPromise = () => Promise.all(promises.map((p) => p()));
            resultTranslationsBeforePromiseResolve.push({
                lang: currentLang,
                localizedAt: new Date().toISOString(),
                allPartitionsPromise: langAllPartitionsPromise,
            });
        }
        let resultTranslationsAfterPrmiseResolve = yield resolveAllLangsLangsPromises(resultTranslationsBeforePromiseResolve, res);
        return resultTranslationsAfterPrmiseResolve;
    });
}
function processTranslations(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let apiKey = req.headers.authorization.split(" ")[1];
        if (!apiKey) {
            return res.end(sseEvent("No API key provided.", "error", 401));
        }
        let schema = joi_1.default.object({
            jsonPartitionsId: joi_1.default.string().min(2).required(),
            langs: joi_1.default.array().items(joi_1.default.string().min(2)).required(),
            includeOutput: joi_1.default.boolean().required(),
        });
        let { error, value } = schema.validate(req.body);
        if (error) {
            return res.end(sseEvent(error, "error", 400));
        }
        else {
            res.write(sseEvent("Your Request data syntax is validated successfully, continuing..\n", "info", 200));
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
            res.write(sseEvent("Validating the saved API key..", "info", 200));
            let userDoc = yield (0, read_1.default)("db", "users", userDocFIlter);
            if (!userDoc) {
                return res.end(sseEvent("Invalid API key, no match found.", "error", 401));
            }
            else {
                res.write(sseEvent(`${userDoc.username}, your API key is valid, continuing..\n`, "info", 200));
            }
            const filterDoc = {
                partitionId: jsonPartitionsId,
            };
            res.write(sseEvent("Re-checking & validating your input file partitions..", "info", 200));
            const partitionsDoc = yield (0, read_1.default)("db", "jsonPartitions", filterDoc);
            if (!partitionsDoc) {
                return res.end(sseEvent("No partitions found for the provided ID, closing request..", "error", 404));
            }
            else {
                res.write(sseEvent("Partitions found & validated successfully, continuing..\n", "info", 200));
            }
            let partitions = partitionsDoc.jsonAsParts;
            let resultTranslations = yield _handlePartitionsTranslations(partitions, langs, res);
            res.write(sseEvent("Localization process is done, saving the outputs to our database..", "info", 200));
            yield (0, update_1.default)("db", "jsonPartitions", filterDoc, {
                $addToSet: {
                    output: {
                        $each: resultTranslations,
                    },
                },
            });
            res.write(sseEvent("Saved the outputs to our database, sending the response..", "info", 200));
            let response = {
                partitionId: jsonPartitionsId,
            };
            if (includeOutput) {
                console.log("including output in response..");
                response.output = resultTranslations;
            }
            yield new Promise((resolve) => setTimeout(resolve, 2000));
            res.end(sseEvent(JSON.stringify(response), "result", 200));
        }
        catch (error) {
            console.error(error);
            res.end(sseEvent(error, "error", 500));
        }
    });
}
exports.default = processTranslations;
//# sourceMappingURL=process_translations.js.map