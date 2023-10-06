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
const insert_1 = __importDefault(require("../../controllers/database/insert"));
function processCliException(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let scheme = joi_1.default.object({
            exception: joi_1.default.string().required(),
            stacktrace: joi_1.default.string().required(),
            platform: joi_1.default.string().required(),
            langsyncVersion: joi_1.default.string().required(),
            Date: joi_1.default.string().required(),
            commandName: joi_1.default.string().required(),
            processId: joi_1.default.string().required().allow(null),
        });
        let { error, value } = scheme.validate(req.body);
        if (error) {
            console.log(error);
            return res.status(400).json({ error: error });
        }
        try {
            yield (0, insert_1.default)("db", "cli_exceptions", value);
            return res.status(200).json({ message: "success" });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ error: error });
        }
    });
}
exports.default = processCliException;
;
//# sourceMappingURL=process_exceptions.js.map