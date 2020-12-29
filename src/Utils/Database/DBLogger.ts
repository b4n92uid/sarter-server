import { Logger as ORMLogger } from "typeorm";
import Logger from "../Logger";

export default class DBLogger implements ORMLogger {
  logQuery(query: string, parameters?: any[]): any {
    Logger.database.debug(`${query} -- ${JSON.stringify(parameters)}`);
  }
  logQueryError(error: string, query: string, parameters?: any[]): any {
    Logger.database.error(error);
    Logger.database.error(`${query} -- ${JSON.stringify(parameters)}`);
  }
  logQuerySlow(time: number, query: string, parameters?: any[]): any {
    Logger.database.warning("Slow query detected");
    Logger.database.warning(`${query} -- ${JSON.stringify(parameters)}`);
  }
  logSchemaBuild(message: string): any {
    Logger.database.debug(message);
  }
  logMigration(message: string): any {
    Logger.database.info(message);
  }
  log(level: "log" | "info" | "warn", message: any): any {
    Logger.database[level](message);
  }
}
