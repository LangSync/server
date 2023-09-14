const express = require("express");
const rtr = express.Router();
const createApiKey = require("../controllers/auth/create_new_api_key_based_on_user_auth_token");
const verifyApiKeyWithUserAuthToken = require("../controllers/auth/validate_api_key_with_user_token");
const saveUser = require("../controllers/users/save_user");
const checkLangSupport = require("../controllers/translate/check_lang_support");
const getUser = require("../controllers/users/get_user");

const savePartitionedJsonOfUser = require("../controllers/users/save_partitioned_json_of_user");
const processTranslations = require("../controllers/translate/process_translations");

const multer = require("multer");
var upload = multer({ dest: "uploads/" });

rtr.post("/save-user-from-provider", saveUser);

rtr.post("/create-api-key", createApiKey);

rtr.get("/user", getUser);

rtr.post("/verify-api-key-with-user-auth-token", verifyApiKeyWithUserAuthToken);

rtr.post(
  "/save-partitioned-json-of-user",
  upload.single("sourceFile"),
  savePartitionedJsonOfUser
);

rtr.post("/process-translation", processTranslations);

rtr.get("/langs/:lang", checkLangSupport);

module.exports = rtr;
