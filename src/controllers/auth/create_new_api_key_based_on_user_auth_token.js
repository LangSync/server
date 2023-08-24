const configs = require("../../configs/server");

export function createNewApiKeyBasedOnUserAuthToken(req, res) {
  const userAuthToken = "...";
  const userId = "user-id";

  const cipher = crypto.createCipher("aes-256-ctr", configs.cipherSecretKey);
  let encryptedAuthToken = cipher.update(userAuthToken, "utf8", "hex");
  encryptedAuthToken += cipher.final("hex");

  res.status(201).json({
    apiKey: encryptedAuthToken,
  });
}
