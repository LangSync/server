const configs = require("../../configs/server");
const crypto = require("crypto");

module.exports = function createNewApiKeyBasedOnUserAuthToken(req, res) {
  const { userAuthToken } = req.body;

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
