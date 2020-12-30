import { toNumber } from "lodash";
import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

import { resolveVar } from "./Config";

const serverFormat = format.printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

function createCustomLogger(label: string, level: string) {
  return createLogger({
    format: format.combine(
      format.label({ label }),
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      serverFormat
    ),
    transports: [
      new transports.Console({ level }),
      new transports.DailyRotateFile({
        level,
        filename: "%DATE%.log",
        dirname: resolveVar("/logs"),
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "5m",
        maxFiles: "30d"
      }),
      new transports.DailyRotateFile({
        level: "debug",
        filename: "%DATE%-verbose.log",
        dirname: resolveVar("/logs"),
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "10d"
      })
    ]
  });
}

require("dotenv").config();

const auth = createCustomLogger("AUTH", "debug");
const query = createCustomLogger("QUERY", "debug");
const database = createCustomLogger(
  "DB",
  toNumber(process.env.DATABASE_LOG_VERBOSE) ? "debug" : "info"
);
const server = createCustomLogger("SERVER", "debug");
const cli = createCustomLogger("CLI", "debug");

export default { auth, query, database, server, cli };
