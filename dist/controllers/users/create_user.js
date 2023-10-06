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
const uuid_1 = __importDefault(require("uuid"));
const read_1 = __importDefault(require("../../controllers/database/read"));
const insert_1 = __importDefault(require("../../controllers/database/insert"));
function _userDocByUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield (0, read_1.default)("db", "users", {
            username: username,
        });
        return user;
    });
}
function createUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let scheme = joi_1.default.object({
            fullName: joi_1.default.string().required(),
            organization: joi_1.default.string().required(),
            username: joi_1.default.string().required(),
            password: joi_1.default.string().required(),
        });
        let { error, value } = scheme.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: error,
            });
        }
        try {
            let userDocByUsername = yield _userDocByUsername(value.username);
            if (!!userDocByUsername) {
                return res.status(400).json({
                    message: "User with username already exists",
                    username: userDocByUsername.username,
                    userId: userDocByUsername.userId,
                });
            }
            let newUserId = uuid_1.default.v4();
            let userCreationDate = new Date();
            const addUserToDatabase = yield (0, insert_1.default)("db", "users", Object.assign(Object.assign({}, value), { userId: newUserId, createdAt: userCreationDate }));
            res.status(200).json({
                fullName: value.fullName,
                organization: value.organization,
                username: value.username,
                userId: newUserId,
                createdAt: userCreationDate,
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    });
}
exports.default = createUser;
;
//# sourceMappingURL=create_user.js.map