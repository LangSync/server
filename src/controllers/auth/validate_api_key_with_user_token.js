const configs = require("../../configs/server");
const crypto = require("crypto");
const Joi = require("joi");

module.exports = function verifyApiKeyWithUserAuthToken(req, res) {
  let schema = Joi.object({
    apiKey: Joi.string().min(2).required(),
    userAuthToken: Joi.string().min(2).required(),
  });

  let { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const { apiKey, userAuthToken } = value;

  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      configs.cipherSecretKey,
      configs.serverInitVector
    );

    let decryptedApiKey = decipher.update(apiKey, "hex", "utf8");
    decryptedApiKey += decipher.final("utf8");

    if (decryptedApiKey === userAuthToken) {
      res.status(200).json({
        message: "Valid API key",
      });
    } else {
      res.status(401).json({
        message: "Invalid API key",
      });
    }
  } catch (error) {
    res.status(401).json({
      message: "Invalid API key",
    });
  }
};
