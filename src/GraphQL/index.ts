import { ApolloServer } from "apollo-server-express";
import { isFunction } from "lodash";
import { getConnection } from "typeorm";

import User from "../Entity/User/User";
import ActivityRecorder from "../Utils/ActivityRecorder";
import Logger from "../Utils/Logger";
import Schema from "./Schema";

function propertyAccess(object, key) {
  if (isFunction(object[key])) return object[key]();

  if (object[key] instanceof Date) return object[key].toISOString();

  if (key in object) return object[key];

  const conn = getConnection();

  if (conn.hasMetadata(object.constructor.name)) {
    const rel = conn
      .getMetadata(object.constructor.name)
      .findRelationWithPropertyPath(key);

    if (rel) {
      if (rel.isManyToOne || rel.isOneToOne) {
        return conn
          .createQueryBuilder()
          .relation(object.constructor.name, key)
          .of(object)
          .loadOne();
      } else {
        return conn
          .createQueryBuilder()
          .relation(object.constructor.name, key)
          .of(object)
          .loadMany();
      }
    }
  }

  return null;
}

export function setupServerApollo(app) {
  const server = new ApolloServer({
    schema: Schema,
    fieldResolver: (source, _args, _context, info) => {
      return propertyAccess(source, info.fieldName);
    },
    context: ({ req }) => ({
      user: req.user,
      activity: new ActivityRecorder(req, req.user as User)
    }),
    formatError: err => {
      Logger.query.error(`${err.name} - ${err.message}`);
      return err;
    }
  });

  server.applyMiddleware({ app, path: "/api" });
}
