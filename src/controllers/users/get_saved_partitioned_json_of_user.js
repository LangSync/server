const Joi = require("joi");
const read = require("../database/read");

module.exports = async function getSavedPartitionedJsonOfUser(req, res) {
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

    let doc = await read("db", "jsonPartitions", docFilter);

    return res.status(200).json(doc);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
