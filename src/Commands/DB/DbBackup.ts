import { backupDatabase, createDatabaseBackupFilename } from "../../Utils/Database/Backup";
import { commandError, commandSuccess } from "../Utils/CommandResponse";

export default {
  command: "db:backup",
  describe: "Trigger the database backup process",
  builder: {
    json: {
      boolean: true,
      default: false
    }
  },
  async handler(argv) {
    try {
      const filename = createDatabaseBackupFilename(new Date());
      await backupDatabase(filename);
      commandSuccess({ message: "☑ Database backup complete", filename }, argv.json);
    } catch (error) {
      commandError("💥 Database backup error", error, argv.json);
    }
  }
};
