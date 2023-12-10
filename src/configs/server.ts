import crypto from "crypto";

export default {
  port: process.env.PORT || 3000,
  cipherSecretKey: crypto.randomBytes(32),
  cipherIv: crypto.randomBytes(16),
};
