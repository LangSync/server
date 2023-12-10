import crypto from "crypto";
import config from "../../configs/server";

export class ApiKeyGenerator {
  static fromEmail(email: string) {
    let stringToUse: string = email + "some random string";

    // generate API key from ciphering the email
    let cipher = crypto.createCipheriv(
      "aes-256-cbc",
      config.cipherSecretKey,
      config.cipherIv
    );

    let encrypted = cipher.update(stringToUse, "utf8", "hex");
    encrypted += cipher.final("hex");

    return encrypted.substring(0, 32);
  }
}
