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
const readMany_1 = __importDefault(require("../database/readMany"));
function getSavedPartitionedJsonOfUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let schema = joi_1.default.object({
            jsonPartitionsId: joi_1.default.string().min(2).required(),
        });
        let { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error });
        }
        let { jsonPartitionsId } = value;
        try {
            let docFilter = {
                partitionId: jsonPartitionsId,
            };
            let projection = {
                _id: 1,
                output: {
                    $map: {
                        input: "$output",
                        as: "output",
                        in: {
                            // show only the "lang" field of the item.
                            lang: "$$output.lang",
                            localizedAt: "$$output.localizedAt",
                            jsonDecodedResponse: "$$output.jsonDecodedResponse",
                        },
                    },
                },
                // take a list field called "cars" and manipulate each item's fields.
                // apiKey: 0,
                // jsonAsParts: 0,
                // createdAt: 1,
                // partitionId: 1,
            };
            let aggregateQuery = [
                {
                    $match: docFilter,
                },
                {
                    $project: projection,
                },
            ];
            let docs = yield (0, readMany_1.default)("db", "jsonPartitions", aggregateQuery);
            let doc = docs[0];
            if (!doc) {
                return res.status(404).json({
                    message: "No such partition found.",
                });
            }
            else {
                return res.status(200).json(doc);
            }
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: error });
        }
    });
}
exports.default = getSavedPartitionedJsonOfUser;
;
//# sourceMappingURL=get_saved_partitioned_json_of_user.js.map