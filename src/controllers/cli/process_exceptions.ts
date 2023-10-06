import Joi from "joi";
import insertToDb from "../../controllers/database/insert";

export default  async function processCliException(req, res) {
  let scheme = Joi.object({
    exception: Joi.string().required(),
    stacktrace: Joi.string().required(),
    platform: Joi.string().required(),
    langsyncVersion: Joi.string().required(),
    Date: Joi.string().required(),
    commandName: Joi.string().required(),
    processId: Joi.string().required().allow(null),
  });

  let { error, value } = scheme.validate(req.body);

  if (error) {
    console.log(error);
    return res.status(400).json({ error: error });
  }

  try {
    await insertToDb("db", "cli_exceptions", value);

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
};
