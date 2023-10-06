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
const insert_1 = __importDefault(require("../../controllers/database/insert"));
const joi_1 = __importDefault(require("joi"));
function saveUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let schema = joi_1.default.object({
                userId: joi_1.default.string().min(2).required(),
            });
            let { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error });
            }
            const addUserToDatabase = yield (0, insert_1.default)("db", "users", Object.assign(Object.assign({}, value), { createdAt: new Date() }));
            return res
                .status(200)
                .json({ message: "User added to database", userData: addUserToDatabase });
        }
        catch (error) {
            return res.status(500).json({ message: error });
        }
    });
}
exports.default = saveUser;
;
//# sourceMappingURL=save_user.js.map