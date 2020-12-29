import { createConnection, getConnectionOptions } from "typeorm";

import { seedDatabase } from "../../Utils/Database/Seed";
import { commandError, commandSuccess } from "../Utils/CommandResponse";

export default {
  command: "db:seed",
  describe: "Create admin user & default company",
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

      await seedDatabase();

      conn.close();

      commandSuccess(`☑ Database seed complete`, argv.json);
    } catch (error) {
      commandError("💥 Database seed error", error, argv.json);
    }
  }
};
