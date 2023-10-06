import express from "express";
let  rtr = express.Router();
import createApiKey from "../controllers/auth/create_new_api_key_based_on_user_auth_token";
import createBetaUserAccountWithApiKey from "../controllers/auth/create_api_key_for_beta";
import verifyApiKeyWithUserAuthToken from "../controllers/auth/validate_api_key_with_user_token";
import saveUser from "../controllers/users/save_user";
import checkLangSupport from "../controllers/translate/check_lang_support";
import getUser from "../controllers/users/get_user";
import createUser from "../controllers/users/create_user";

import savePartitionedJsonOfUser from "../controllers/users/save_partitioned_json_of_user";

import getSavedPartitionedJsonOfUser from "../controllers/users/get_saved_partitioned_json_of_user";
import processTranslations from "../controllers/translate/process_translations";
import processCliException from "../controllers/cli/process_exceptions";

import multer from "multer";
var upload = multer({ dest: "uploads/" });

rtr.post("/save-user-from-provider", saveUser);

rtr.post("/create-api-key", createApiKey);

rtr.post("/create-account-with-api-key-beta", createBetaUserAccountWithApiKey);

rtr.get("/user", getUser);

rtr.post("/users", createUser);

rtr.post("/verify-api-key-with-user-auth-token", verifyApiKeyWithUserAuthToken);

rtr.post(
  "/save-partitioned-json-of-user",
  upload.single("sourceFile"),
  savePartitionedJsonOfUser
);

rtr.get("/get-partitioned-json-of-user", getSavedPartitionedJsonOfUser);

rtr.post("/process-translation", processTranslations);

rtr.post("/langs-support", checkLangSupport);

rtr.post("/log-exception", processCliException);

export default  rtr;
