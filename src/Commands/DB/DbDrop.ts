import { createConnection, getConnectionOptions } from "typeorm";

import { commandError, commandSuccess } from "../Utils/CommandResponse";

export default {
  command: "db:drop",
  describe: "Delete the database",
  builder: {
    verbose: {
      alias: "v",
      boolean: true,
      default: false
    },
    json: {
      boolean: true,
      default: false
    }
  },
  async handler(argv) {
    try {
      const conn = await createConnection({
        ...(await getConnectionOptions()),
        logging: argv.verbose
      });

      await conn.dropDatabase();

      conn.close();

      commandSuccess(`☑ Database drop complete`, argv.json);
    } catch (error) {
      commandError("💥 Database drop error", error, argv.json);
    }
  }
};
