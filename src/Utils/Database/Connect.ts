import { CronJob } from "cron";
import { merge } from "lodash";
import { ConnectionOptions, createConnection, getConnectionOptions } from "typeorm";

import DBLogger from "./DBLogger";
import Logger from "../Logger";
import { backupDatabase, createDatabaseBackupFilename } from "./Backup";

export async function connectToDatabase(opts: Partial<ConnectionOptions> = {}) {
  const conOpts = await getConnectionOptions();

  merge(conOpts, opts);

  await createConnection({
    ...conOpts,
    logger: new DBLogger()
  });

  Logger.database.info("🗃 Database connected");
}

export async function setupAutoBackup() {
  const job = new CronJob(process.env.DATABASE_BACKUP_CRON, async () => {
    Logger.database.info(`⏲ Database backup triggered`);

    const filepath = createDatabaseBackupFilename(new Date());
    await backupDatabase(filepath);
  });

  job.start();

  Logger.database.info(`⏲ Database backup scheduled at ${process.env.DATABASE_BACKUP_CRON}`);
}

export async function initDatabase() {
  await connectToDatabase();
  await setupAutoBackup();
}
