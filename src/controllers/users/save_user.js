const insertToDb = require("../../controllers/database/insert");
const Joi = require("joi");

module.exports = async function saveUser(req, res) {
  let schema = Joi.object({
    userId: Joi.string().min(2).required(),
    userAuthToken: Joi.string().min(2).required(),
  });

  let { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const addUserToDatabase = await insertToDb("db", "users", value);

  return res
    .status(200)
    .json({ message: "User added to database", userData: addUserToDatabase });
};
