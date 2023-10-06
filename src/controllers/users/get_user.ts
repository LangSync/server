import readMany from  "../../controllers/database/readMany";
import Joi from  "joi";

export default  async function getUser(req, res) {
  if (!req.headers["authorization"]) {
    return res.status(400).json({
      message:
        "You need to provide a valid Bearer API key in the authorization header.",
    });
  }

  try {
    let apiKey = req.headers.authorization.split(" ")[1];

    if (!apiKey) {
      res   
        .sendStatus(400)
        .json({ message: "Invalid API key, no user match that key" });
    }

    let documentFilterToRead = {
      apiKeys: {
        $elemMatch: {
          apiKey: apiKey,
        },
      },
    };

    let projection = {
      _id: 1,
      userAuthToken: 1,
      userId: 1,
      apiKeysLength: { $size: "$apiKeys" },
      createdAt: 1,
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
        message: "Invalid API key, no user match that key",
      });
    } else {
      let userId = userDocumment.userId;

      let localizationDocsFilter = {
        userId: userId,
      };

      let localizationDocsProject = {
        jsonPartsLength: {
          $size: "$jsonAsParts",
        },

        createdAt: 1,

        outputLangs: {
          $reduce: {
            input: "$output",
            initialValue: [],
            in: { $concatArrays: ["$$value", ["$$this.lang"]] },
          },
        },
        partitionId: 1,
      };

      let localizedDocsAggregateQuery = [
        {
          $match: localizationDocsFilter,
        },
        {
          $project: localizationDocsProject,
        },
      ];

      let localizationDocs = await readMany(
        "db",
        "jsonPartitions",
        localizedDocsAggregateQuery
      );

      userDocumment.localizationDocs = localizationDocs;

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
