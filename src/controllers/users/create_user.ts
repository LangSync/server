import Joi from "joi";
import uuid from "uuid";
import findInDb from "../../controllers/database/read";
import  insertToDb from "../../controllers/database/insert";

async function _userDocByUsername(username) {
  let user = await findInDb("db", "users", {
    username: username,
  });

  return user;
}

export default  async function createUser(req, res) {
  let scheme = Joi.object({
    fullName: Joi.string().required(),
    organization: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  let { error, value } = scheme.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error,
    });
  }

  try {
    let userDocByUsername = await _userDocByUsername(value.username);

    if (!!userDocByUsername) {
      return res.status(400).json({
        message: "User with username already exists",
        username: userDocByUsername.username,
        userId: userDocByUsername.userId,
      });
    }

    let newUserId = uuid.v4();
    let userCreationDate = new Date();

    const addUserToDatabase = await insertToDb("db", "users", {
      ...value,
      userId: newUserId,
      createdAt: userCreationDate,
    });

    res.status(200).json({
      fullName: value.fullName,
      organization: value.organization,
      username: value.username,
      userId: newUserId,
      createdAt: userCreationDate,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};
