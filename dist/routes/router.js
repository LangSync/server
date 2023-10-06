"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
let rtr = express_1.default.Router();
const create_new_api_key_based_on_user_auth_token_1 = __importDefault(require("../controllers/auth/create_new_api_key_based_on_user_auth_token"));
const create_api_key_for_beta_1 = __importDefault(require("../controllers/auth/create_api_key_for_beta"));
const validate_api_key_with_user_token_1 = __importDefault(require("../controllers/auth/validate_api_key_with_user_token"));
const save_user_1 = __importDefault(require("../controllers/users/save_user"));
const check_lang_support_1 = __importDefault(require("../controllers/translate/check_lang_support"));
const get_user_1 = __importDefault(require("../controllers/users/get_user"));
const create_user_1 = __importDefault(require("../controllers/users/create_user"));
const save_partitioned_json_of_user_1 = __importDefault(require("../controllers/users/save_partitioned_json_of_user"));
const get_saved_partitioned_json_of_user_1 = __importDefault(require("../controllers/users/get_saved_partitioned_json_of_user"));
const process_translations_1 = __importDefault(require("../controllers/translate/process_translations"));
const process_exceptions_1 = __importDefault(require("../controllers/cli/process_exceptions"));
const multer_1 = __importDefault(require("multer"));
var upload = (0, multer_1.default)({ dest: "uploads/" });
rtr.post("/save-user-from-provider", save_user_1.default);
rtr.post("/create-api-key", create_new_api_key_based_on_user_auth_token_1.default);
rtr.post("/create-account-with-api-key-beta", create_api_key_for_beta_1.default);
rtr.get("/user", get_user_1.default);
rtr.post("/users", create_user_1.default);
rtr.post("/verify-api-key-with-user-auth-token", validate_api_key_with_user_token_1.default);
rtr.post("/save-partitioned-json-of-user", upload.single("sourceFile"), save_partitioned_json_of_user_1.default);
rtr.get("/get-partitioned-json-of-user", get_saved_partitioned_json_of_user_1.default);
rtr.post("/process-translation", process_translations_1.default);
rtr.post("/langs-support", check_lang_support_1.default);
rtr.post("/log-exception", process_exceptions_1.default);
exports.default = rtr;
//# sourceMappingURL=router.js.map