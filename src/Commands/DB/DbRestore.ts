import { createConnection, getConnectionOptions } from "typeorm";

import { findDatabaseBackupFile, restoreDatabase } from "../../Utils/Database/Restore";
import { commandError, commandSuccess } from "../Utils/CommandResponse";

export default {
  command: "db:restore [filename] [pattern]",
  describe: "Restore database from absolute filename or a glob pattern from backup directory",
  builder: {
    filename: {
      string: true,
      describe: "The absolute filenam SQL backup to restor from"
    },
    pattern: {
      string: true,
      describe: "A glob pattern that match backup filename to restor from"
    },
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
      if (!argv.filename && !argv.pattern) {
        commandError("Must provide --filename or --pattern paramater", null, argv.json);
        return;
      }

      if (argv.pattern) {
        const files = await findDatabaseBackupFile(argv.pattern);

        if (files.length == 0) {
          commandError("No files entries found !", null, argv.json);
          return;
        } else if (files.length > 1) {
          commandError(`Multiple files entries found :\n${files.join("\n")}`, null, argv.json);
          return;
        } else {
          argv.filename = files[0];
        }
      }

      const conn = await createConnection({
        ...(await getConnectionOptions()),
        logging: argv.verbose
      });

      await restoreDatabase(conn, argv.filename);

      await conn.close();

      commandSuccess(
        { message: "☑ Database restore complete", filename: argv.filename },
        argv.json
      );
    } catch (error) {
      commandError("💥 Database restore error", error, argv.json);
    }
  }
};
