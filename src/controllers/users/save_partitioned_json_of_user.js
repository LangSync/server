const json_tiktoken_separator = require("../utils/json_tiktoken_separator");
const insert = require("../database/insert");
const { v4 } = require("uuid");
const fs = require("fs");
const multer = require("multer");

module.exports = async function save_partitioned_json_of_user(req, res) {
  try {
    const filePath = req.file.path;

    const uploadedJsonFile = fs.readFileSync(filePath, "utf8");

    let apiKey = req.headers.authorization.split(" ")[1];

    const parsedJson = JSON.parse(uploadedJsonFile);
    const jsonAsParts = json_tiktoken_separator(parsedJson);
    const idForThisPartitionedJson = v4();

    const doc = {
      apiKey: apiKey,
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
