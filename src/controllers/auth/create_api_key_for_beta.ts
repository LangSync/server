import configs from "../../configs/server";
import crypto from "crypto";
import Joi from "joi";
import update from "../database/update";
import findInDb from "../database/read";
import insertToDb from "../database/insert";
import { v4 } from "uuid";

export default async function createBetaUserAccountWithApiKey(req, res) {
  let schema = Joi.object({
    username: Joi.string().min(2).required(),
  });

  let { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  try {
    let apiKey = crypto
      .createHmac("sha256", configs.cipherSecretKey)
      .update(value.username + "-" + new Date().getTime())
      .digest("hex");

    let apiKeyItem = {
      $currentDate: {
        date: { $type: "date" },
      },
      apiKey: apiKey,
    };

    let filterDoc = {
      username: value.username,
    };

    let userDoc = await findInDb("db", "users", filterDoc);

    if (!userDoc) {
      let createdUserDoc = await insertToDb("db", "users", {
        username: value.username,
        userId: v4(),
        createdAt: new Date(),
      });
    }

    let updateDoc = {
      $push: {
        apiKeys: apiKeyItem,
      },
    };

    await update("db", "users", filterDoc, updateDoc);

    res.status(201).json({
      message: "New API key created & saved successfully",
      username: value.username,
      apiKey: apiKey,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
}