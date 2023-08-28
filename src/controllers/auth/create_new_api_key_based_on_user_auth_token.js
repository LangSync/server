const configs = require("../../configs/server");
const crypto = require("crypto");
const Joi = require("joi");

module.exports = function createNewApiKeyBasedOnUserAuthToken(req, res) {
  let schema = Joi.object({
    userAuthToken: Joi.string().min(2).required(),
  });

  let { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  let { userAuthToken } = value;

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    configs.cipherSecretKey,
    configs.serverInitVector
  );

  let encryptedAuthToken = cipher.update(userAuthToken, "utf8", "hex");
  encryptedAuthToken += cipher.final("hex");

  res.status(201).json({
    apiKey: encryptedAuthToken,
  });
};
