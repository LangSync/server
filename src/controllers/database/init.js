const dbConfig = require("../../configs/db");
const client = require("./client");

async function init() {
  try {
    await client.connect();

    await client.db("admin").command({ ping: 1 });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.dir(err);
  }
}

module.exports = init;
