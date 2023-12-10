import { Response, Request } from "express";
import Joi from "joi";
import { LangSyncDatabase } from "../database/database";
import { v4 } from "uuid";
import { ApiKeyGenerator } from "../utils/api_key_generator";

export default async function userInfo(req: Request, res: Response) {
  try {
    let scheme = Joi.object({
      email: Joi.string().email().required(),
    });

    let { error, value } = scheme.validate(req.body);

    if (error) {
      res.status(400).json({
        message: error.message,
      });
    } else {
      let user = await LangSyncDatabase.instance.read.userDocByEmail(
        value.email
      );

      if (user) {
        res.status(200).json({
          user,
        });
      } else {
        await LangSyncDatabase.instance.insert.newUserDoc({
          username: value.email,
          email: value.email,
          userId: v4(),
          createdAt: new Date().toISOString(),
          apiKeys: [
            {
              $currentDate: {
                createdAt: true,
              },
              apiKey: ApiKeyGenerator.fromEmail(value.email),
            },
          ],
        });

        let user = await LangSyncDatabase.instance.read.userDocByEmail(
          value.email
        );

        if (user) {
          res.status(200).json({
            user,
          });
        } else {
          res.status(400).json({
            message: "Unable to create user",
          });
        }
      }
    }
  } catch (error) {
    res.status(500).json({
      message: error,
    });
  }
}
