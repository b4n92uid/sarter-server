import { ForbiddenError } from "apollo-server-express";
import User from "../Entity/User/User";
import Logger from "./Logger";

export function throwIfNotGranted(user: User, access: string | string[]) {
  if (!user) {
    Logger.query.warn(`access denied from "anonymous" on ${access}`);
    throw new ForbiddenError("Access not granted");
  }

  if (!user.isGranted(access)) {
    Logger.query.warn(`access denied from "${user.username}" on ${access}`);
    throw new ForbiddenError("Access not granted");
  }
}

export function throwIfNotGrantedOnModel(
  user: User,
  model: any,
  action: string
) {
  const specificAction = `${model.name.toUpperCase()}_${action.toUpperCase()}`;
  const generalAction = `${model.name.toUpperCase()}_ALL`;

  throwIfNotGranted(user, [specificAction, generalAction]);
}

export const CRUD_OP = {
  LIST: "LIST",
  GET: "GET",
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE"
};
