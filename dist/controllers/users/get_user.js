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
const readMany_1 = __importDefault(require("../../controllers/database/readMany"));
function getUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.headers["authorization"]) {
            return res.status(400).json({
                message: "You need to provide a valid Bearer API key in the authorization header.",
            });
        }
        try {
            let apiKey = req.headers.authorization.split(" ")[1];
            if (!apiKey) {
                res
                    .sendStatus(400)
                    .json({ message: "Invalid API key, no user match that key" });
            }
            let documentFilterToRead = {
                apiKeys: {
                    $elemMatch: {
                        apiKey: apiKey,
                    },
                },
            };
            let projection = {
                _id: 1,
                userAuthToken: 1,
                userId: 1,
                apiKeysLength: { $size: "$apiKeys" },
                createdAt: 1,
            };
            let aggregateQuery = [
                {
                    $match: documentFilterToRead,
                },
                {
                    $project: projection,
                },
            ];
            let userDocumments = yield (0, readMany_1.default)("db", "users", aggregateQuery);
            let userDocumment = userDocumments[0];
            if (!userDocumment) {
                return res.status(401).json({
                    message: "Invalid API key, no user match that key",
                });
            }
            else {
                let userId = userDocumment.userId;
                let localizationDocsFilter = {
                    userId: userId,
                };
                let localizationDocsProject = {
                    jsonPartsLength: {
                        $size: "$jsonAsParts",
                    },
                    createdAt: 1,
                    outputLangs: {
                        $reduce: {
                            input: "$output",
                            initialValue: [],
                            in: { $concatArrays: ["$$value", ["$$this.lang"]] },
                        },
                    },
                    partitionId: 1,
                };
                let localizedDocsAggregateQuery = [
                    {
                        $match: localizationDocsFilter,
                    },
                    {
                        $project: localizationDocsProject,
                    },
                ];
                let localizationDocs = yield (0, readMany_1.default)("db", "jsonPartitions", localizedDocsAggregateQuery);
                userDocumment.localizationDocs = localizationDocs;
                return res.status(200).json({
                    message: "User found",
                    user: userDocumment,
                });
            }
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
            });
        }
    });
}
exports.default = getUser;
;
//# sourceMappingURL=get_user.js.map