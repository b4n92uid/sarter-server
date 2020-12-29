import * as dotenv from "dotenv";
import { Server } from "http";
import { setupServerRoutes } from "./Controller";
import { setupServerApollo } from "./GraphQL";
import { setupServerAuth } from "./Utils/Authentication";
import { resolveVar } from "./Utils/Config";
import { initDatabase } from "./Utils/Database/Connect";
import Logger from "./Utils/Logger";
import sleep from "./Utils/Sleep";
import { SERVER_VERSION } from "./Utils/Versions";

import cors = require("cors");
import express = require("express");
import bodyParser = require("body-parser");

dotenv.config();

async function main() {
  let retry = false;
  let server: Server = null;
  do {
    try {
      Logger.server.info(`Server v${SERVER_VERSION} on ${process.env.NODE_ENV} environment`);

      await initDatabase();

      const app = express();

      app.set("trust proxy", true);
      app.use(cors());
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json({ limit: "5mb" }));
      app.use("/uploads", express.static(resolveVar("/uploads")));

      setupServerAuth(app);

      setupServerRoutes(app);

      setupServerApollo(app);

      server = app.listen(parseInt(process.env.PORT), () => {
        Logger.server.info(`🚀 Ready at http://localhost:${process.env.PORT}/api`);
      });
      retry = false;
    } catch (error) {
      Logger.database.error(`💥 Server initialization error: ${error}`);
      if (server) server.close();
      retry = true;
      await sleep(4000);
    }
  } while (retry);
}

main();
