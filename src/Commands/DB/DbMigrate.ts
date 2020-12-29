import { createConnection, getConnectionOptions } from "typeorm";

import { commandError, commandSuccess } from "../Utils/CommandResponse";

export default {
  command: "db:migrate",
  describe: "Execute pending migration",
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

      await conn.runMigrations();

      conn.close();

      commandSuccess(`☑ Database migration complete`, argv.json);
    } catch (error) {
      commandError("💥 Database migration error", error, argv.json);
    }
  }
};
