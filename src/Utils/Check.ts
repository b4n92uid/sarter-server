import { ForbiddenError } from "apollo-server-express";
import User from "../Entity/User/User";
import Logger from "./Logger";
import { Context } from "./Context";
import { GraphQLResolveInfo } from "graphql";

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

export function logCrudAction(
  args: any,
  ctx: Context,
  info: GraphQLResolveInfo
) {
  if (ctx.user) {
    Logger.query.debug(
      `@${ctx.user.username} ${info.fieldName} ${JSON.stringify(args)}`
    );
  } else {
    Logger.query.debug(`@anonymous ${info.fieldName} ${JSON.stringify(args)}`);
  }
}

export function checkCrudAction(model, user: User, action: string) {
  throwIfNotGrantedOnModel(user, model, action);
}

export const CRUD_OP = {
  LIST: "LIST",
  GET: "GET",
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE"
};
