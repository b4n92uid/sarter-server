import compressing from "compressing";
import { format } from "date-fns";
import { unlinkSync } from "fs";
import { trimStart } from "lodash";
import mysqldump from "mysqldump";
import { resolveRoot } from "../Config";

export function createDatabaseBackupFilename(date: Date): string {
  const filename = `database_${format(date, "yyyyMMddHHmmss")}.sql.gz`;
  return resolveRoot(`/var/backups/${filename}`);
}

export async function backupDatabase(dest: string): Promise<void> {
  const dbString = new URL(process.env.DATABASE_URL);

  const tmpFilename = dest + ".tmp";

  await mysqldump({
    connection: {
      host: dbString.hostname,
      user: dbString.username,
      password: dbString.password,
      database: trimStart(dbString.pathname, "/")
    },
    dumpToFile: tmpFilename
  });

  await compressing.gzip.compressFile(tmpFilename, dest);

  unlinkSync(tmpFilename);
}
