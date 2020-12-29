import fg from "fast-glob";
import { createReadStream } from "fs";
import { chunk, map, trim } from "lodash";
import { terminal } from "terminal-kit";
import { Connection } from "typeorm";
import { createGunzip } from "zlib";

import { resolveRoot } from "../Config";

export async function findDatabaseBackupFile(expr: string): Promise<string[]> {
  const backupDir = resolveRoot("/var/backups");
  return fg([`${backupDir}/*${expr}*`]);
}

async function decompressSqlFile(filename): Promise<string> {
  const gzip = createGunzip();
  const stream = createReadStream(filename);

  let sqlContent = "";

  return new Promise((resolve, reject) => {
    gzip
      .on("data", (chunk: Buffer) => {
        sqlContent += chunk.toString();
      })
      .on("error", error => {
        reject(error);
      })
      .on("end", async () => {
        resolve(sqlContent);
      });

    stream.pipe(gzip);
  });
}

export async function restoreDatabase(conn: Connection, filename: string): Promise<void> {
  const progressBar = terminal.progressBar({
    title: "Restoring database:",
    eta: true,
    percent: true
  });

  progressBar.update(null);

  await conn.dropDatabase();

  try {
    const sql = await decompressSqlFile(filename);

    const groupSize = 1000;
    const queryGroups = chunk(sql.split(";\n"), groupSize);

    for (let i = 0; i < queryGroups.length; i++) {
      const queries = queryGroups[i];

      const queriesAction = map(queries, async q => {
        q = trim(q);
        if (q) await conn.query(q);
      });

      await Promise.all(queriesAction);

      progressBar.update(i / queryGroups.length);
    }
  } catch (error) {}

  progressBar.stop();
}
