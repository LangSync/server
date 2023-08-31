const readMany = require("../../controllers/database/readMany");
const Joi = require("joi");

module.exports = async function saveUser(req, res) {
  if (!req.headers["authorization"]) {
    return res.status(400).json({ message: error });
  }

  try {
    let AuthorizationKey = req.headers.authorization.split(" ")[1];
    if (!AuthorizationKey) {
      res.sendStatus(401).json({ message: "Invalid Authorization Key" });
    }

    let documentFilterToRead = {
      apiKeys: {
        $elemMatch: {
          apiKey: AuthorizationKey,
        },
      },
    };

    let projection = {
      _id: 1,
      userAuthToken: 1,
      userId: 1,
      apiKeysLength: { $size: "$apiKeys" },
    };

    let aggregateQuery = [
      {
        $match: documentFilterToRead,
      },
      {
        $project: projection,
      },
    ];

    let userDocumments = await readMany("db", "users", aggregateQuery);

    let userDocumment = userDocumments[0];

    if (!userDocumment) {
      return res.status(401).json({
        message: "Invalid Authorization Key",
      });
    } else {
      console.log(userDocumment.apiKeys);

      // userDocumment.apiKeysLength = apiKeysLength;

      // delete userDocumment.apiKeys;

      return res.status(200).json({
        message: "User found",
        user: userDocumment,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
