import Joi from "joi";
import readMany from "../database/readMany";

export default  async function getSavedPartitionedJsonOfUser(req, res) {
  let schema = Joi.object({
    jsonPartitionsId: Joi.string().min(2).required(),
  });

  let { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  let { jsonPartitionsId } = value;

  try {
    let docFilter = {
      partitionId: jsonPartitionsId,
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
      // partitionId: 1,
    };

    let aggregateQuery = [
      {
        $match: docFilter,
      },
      {
        $project: projection,
      },
    ];

    let docs = await readMany("db", "jsonPartitions", aggregateQuery);

    let doc = docs[0];

    if (!doc) {
      return res.status(404).json({
        message: "No such partition found.",
      });
    } else {
      return res.status(200).json(doc);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};
