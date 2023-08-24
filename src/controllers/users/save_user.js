const insertToDb = require("../../controllers/database/insert");

export async function saveUser(req, res) {
  const { tokenFromProvider } = req.body;

  if (!tokenFromProvider) {
    return res.status(400).json({ error: "Token not found" });
  } else {
    const addUserToDatabase = await insertToDb("db", "users", { ...body });

    return res
      .status(200)
      .json({ message: "User added to database", userData: addUserToDatabase });
  }
}
