import { map } from "lodash";
import { createConnection, getConnection, getConnectionOptions, MigrationExecutor } from "typeorm";

import { seedDatabase } from "../../Utils/Database/Seed";
import { commandError, commandSuccess } from "../Utils/CommandResponse";

export default {
  command: "db:init",
  describe: "Sync, Migrate & Seed",
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

      await conn.synchronize();

      const migrator = new MigrationExecutor(conn, conn.createQueryRunner("master"));

      await migrator.getPendingMigrations();

      await Promise.all(
        map(await migrator.getAllMigrations(), migration => migrator.insertMigration(migration))
      );

      await seedDatabase();

      commandSuccess(`☑ Database initialization complete`, argv.json);
    } catch (error) {
      commandError("💥 Database initialization error", error, argv.json);
    }

    await getConnection().close();
  }
};
