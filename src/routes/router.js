const express = require("express");
const rtr = express.Router();

const createApiKey = require("../controllers/auth/create_new_api_key_based_on_user_auth_token");
const verifyApiKeyWithUserAuthToken = require("../controllers/auth/validate_api_key_with_user_token");
const saveUser = require("../controllers/users/save_user");

rtr.post("/save-user-from-provider", saveUser);
rtr.post("/create-api-key", createApiKey);
rtr.post("/verify-api-key-with-user-auth-token", verifyApiKeyWithUserAuthToken);

module.exports = rtr;
