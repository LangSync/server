const configs = require("../../configs/server");
const crypto = require("crypto");
const Joi = require("joi");
const update = require("../database/update");

module.exports = async function createNewApiKeyBasedOnUserAuthToken(req, res) {
  let schema = Joi.object({
    userId: Joi.string().min(2).required(),
  });

  let { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  try {
    let apiKey = crypto
      .createHmac("sha256", configs.cipherSecretKey)
      .update(value.userId + "-" + new Date().getTime())
      .digest("hex");

    let apiKeyItem = {
      $currentDate: {
        date: { $type: "date" },
      },
      apiKey: apiKey,
    };

    let filterDoc = {
      userId: value.userId,
    };

    let updateDoc = {
      $push: {
        apiKeys: apiKeyItem,
      },
    };

    await update("db", "users", filterDoc, updateDoc);

    res.status(201).json({
      message: "New API key created & saved successfully",
      apiKey: apiKey,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
};
