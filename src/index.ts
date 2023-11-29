require("dotenv").config();

import express from "express";

import configs from "./configs/server";

import router from "./routes/router";

import morgan from "morgan";
import { LangSyncDatabaseClient } from "./controllers/database/client";

const langSyncServerApp = express();

(async () => await LangSyncDatabaseClient.init())();

langSyncServerApp.use(morgan(":method :url :status - :response-time ms"));

langSyncServerApp.use(express.json());

langSyncServerApp.use(express.urlencoded({ extended: true }));

langSyncServerApp.use("/", router);

langSyncServerApp.listen(configs.port, () => {
  console.log(`LangSync server is running on localhost:${configs.port}`);
});
