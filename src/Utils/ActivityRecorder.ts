import { Request } from "express";
import { getRepository } from "typeorm";

import Activity from "../Entity/Activity/Activity";
import User from "../Entity/User/User";
import Logger from "./Logger";

export default class ActivityRecorder {
  constructor(private req: Request, private user: User) {}

  private async create(msg: string, params: any[], level: number) {
    await getRepository(Activity).save({
      user: this.user,
      level: level,
      content: msg,
      params: params,
      ip: this.req.ip,
      hostname: this.req.header("x-hostname") || "N/A",
      machineId: this.req.header("x-machine-id") || "N/A"
    });

    for (let i = 0; i < params.length; i++) {
      if (params[i]) msg = msg.replace(`{${i}}`, "`" + params[i].toString() + "`");
      else msg = msg.replace(`{${i}}`, "null");
    }

    Logger.query.info(msg);
  }

  record(msg: string, params: Array<string | number> = []) {
    this.create(msg, params, 0);
  }
  info(msg: string, params: Array<string | number> = []) {
    this.create(msg, params, 1);
  }
  warn(msg: string, params: Array<string | number> = []) {
    this.create(msg, params, 2);
  }
}
