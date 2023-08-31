const configs = require("../../configs/server");
const crypto = require("crypto");
const Joi = require("joi");
const findOne = require("../database/read");

module.exports = async function verifyApiKeyWithUserAuthToken(req, res) {
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
    let document = await findOne("db", "users", {
      userAuthToken: userAuthToken,
    });

    if (!document) {
      return res.status(401).json({
        message: "Invalid User Auth Token",
      });
    }
    let apiKeyFromDocument = document.apiKeys.find(
      (item) => item.apiKey === apiKey
    );

    if (!apiKeyFromDocument) {
      return res.status(401).json({
        message: "Invalid API key",
      });
    } else {
      return res.status(200).json({
        message: "API key is valid",
      });
    }
  } catch (error) {
    res.status(401).json({
      message: "Invalid API key",
    });
  }
};
