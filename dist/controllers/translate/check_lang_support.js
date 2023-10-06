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
const joi_1 = __importDefault(require("joi"));
function _checkLangsSupport(langs) {
    return __awaiter(this, void 0, void 0, function* () {
        const openai = new openai_1.OpenAI({
            apiKey: openai_2.default.openAI,
        });
        let res = yield openai.chat.completions.create({
            model: openai_2.default.jsonOpenAIModel,
            temperature: 0.9,
            messages: [
                {
                    role: "assistant",
                    content: openai_2.default.langsSupportInstruction,
                },
                {
                    role: "user",
                    content: langs.join(", "),
                },
            ],
        });
        let con = res.choices[0].message.content;
        console.log(con);
        return con.split(", ");
    });
}
function default_1(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let schema = joi_1.default.object({
            langs: joi_1.default.array().items(joi_1.default.string().required()).required(),
        });
        let { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error });
        }
        try {
            let checkResult = yield _checkLangsSupport(value.langs);
            return res.status(200).json({ checkResultList: checkResult });
        }
        catch (err) {
            console.log(err);
            res.status(500).send("Internal server error");
        }
    });
}
exports.default = default_1;
;
//# sourceMappingURL=check_lang_support.js.map