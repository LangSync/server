import Joi from "joi";
import { Request, Response } from "express";

import { LangSyncDatabase } from "../database/database";

export default async function getSavedPartitionedJsonOfUser(
  req: Request,
  res: Response
) {
  let schema = Joi.object({
    operationId: Joi.string().min(2).required(),
  });

  let { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  let { operationId } = value;

  try {
    let docFilter = {
      operationId: operationId,
    };

    let projection = {
      _id: 1,
      output: {
        $map: {
          input: "$output",
          as: "output",
          in: {
            // show only the "lang" field of the item.
            lang: "$$output.lang",
            localizedAt: "$$output.localizedAt",
            jsonDecodedResponse: "$$output.jsonDecodedResponse",
          },
        },
      },
      // take a list field called "cars" and manipulate each item's fields.

      // apiKey: 0,
      // jsonAsParts: 0,
      // createdAt: 1,
      // operationId: 1,
    };

    let aggregateQuery = [
      {
        $match: docFilter,
      },
      {
        $project: projection,
      },
    ];

    let docs = await LangSyncDatabase.instance.read.readMany(
      "db",
      "jsonPartitions",
      aggregateQuery
    );

    let doc = docs[0];

    if (!doc) {
      return res.status(404).json({
        message: "No such partition found.",
      });
    } else {
      return res.status(200).json(doc);
    }
  } catch (error) {
    LangSyncLogger.instance.log({
      message: error,
      type: loggingTypes.error,
    });
    return res.status(500).json({ message: error });
  }
}
