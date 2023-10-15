import insertToDb  from "../../controllers/database/insert";
import Joi  from "joi";

export default  async function saveUser(req, res) {
  try {
    let schema = Joi.object({
      userId: Joi.string().min(2).required(),
    });

    let { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const addUserToDatabase = await insertToDb("db", "users", {
      ...value,
      createdAt: new Date(),
    });

    return res
      .status(200)
      .json({ message: "User added to database", userData: addUserToDatabase });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};