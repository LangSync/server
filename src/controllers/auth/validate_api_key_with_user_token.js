const configs = require("../../configs/server");
const crypto = require("crypto");

module.exports = function verifyApiKeyWithUserAuthToken(req, res) {
  const { apiKey, userAuthToken } = req.body;

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
