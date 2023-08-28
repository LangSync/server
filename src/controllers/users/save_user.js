const insertToDb = require("../../controllers/database/insert");

module.exports = async function saveUser(req, res) {
  if (!req.body) {
    console.log("Invalid request body");
    return res.status(400).json({ error: "Invalid request body" });
  } else {
    console.log("Request body is valid");
    const addUserToDatabase = await insertToDb("db", "users", req.body);

    return res
      .status(200)
      .json({ message: "User added to database", userData: addUserToDatabase });
  }
};
