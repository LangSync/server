const json_tiktoken_separator = require("../utils/json_tiktoken_separator");
const insert = require("../database/insert");
const read = require("../database/read");
const { v4 } = require("uuid");
const fs = require("fs");
const configs = require("../../configs/openai");

const { OpenAI } = require("openai");

async function _isHarmingOpenAIPolicy(messageToOpenAI) {
  let openai = new OpenAI({
    apiKey: configs.openAI,
  });

  try {
    console.log("starting moderation request");
    let moderationsRes = await openai.moderations.create({
      input: messageToOpenAI.toString(),
    });

    console.log("moderation request finished");

    return typeof moderationsRes.results[0].flagged === "boolean"
      ? moderationsRes.results[0].flagged
      : false;
  } catch (error) {
    if (error.status === 429) {
      console.log(
        "OpenAI API rate limit reached, waiting 20 seconds for next moderation request"
      );

      await new Promise((resolve) =>
        setTimeout(
          resolve,
          configs.delayForRateLimitNextRequestInSeconds * 1000
        )
      );

      console.log("20 seconds passed, continuing request");
      return await _isHarmingOpenAIPolicy(messageToOpenAI);
    } else {
      throw error;
    }
  }
}

module.exports = async function save_partitioned_json_of_user(req, res) {
  try {
    const filePath = req.file.path;

    const uploadedJsonFile = fs.readFileSync(filePath, "utf8");

    let apiKey = req.headers.authorization.split(" ")[1];

    let isHarming = await _isHarmingOpenAIPolicy(uploadedJsonFile);

    if (isHarming) {
      console.log(
        "The provided content violates our policy, and so it is unacceptable to be processed."
      );

      return res.status(400).json({
        message:
          "The provided content violates our policy, and so it is unacceptable to be processed.",
      });
    } else {
      console.log("The provided content is acceptable to be processed.");
    }

    console.log(uploadedJsonFile);

    const parsedJson = JSON.parse(uploadedJsonFile);
    const jsonAsParts = json_tiktoken_separator(parsedJson);
    const idForThisPartitionedJson = v4();

    let userDocFilter = {
      apiKeys: {
        $elemMatch: {
          apiKey: apiKey,
        },
      },
    };

    let userDoc = await read("db", "users", userDocFilter);
    let userId = userDoc.userId;

    const doc = {
      userId: userId,
      jsonAsParts: jsonAsParts,
      createdAt: new Date().toISOString(),
      partitionId: idForThisPartitionedJson,
    };

    await insert("db", "jsonPartitions", doc);
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: "Successfully saved partitioned json",
      partitionId: idForThisPartitionedJson,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};
