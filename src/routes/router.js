const router = require('express').Router();
const createApiKey = require('../controllers/auth/create_new_api_key_based_on_user_auth_token');
const verifyApiKeyWithUserAuthToken = require('../controllers/auth/verify_api_key_with_user_auth_token');

router.post('/create-api-key', createApiKey);
router.post('/verify-api-key-with-user-auth-token', verifyApiKeyWithUserAuthToken);