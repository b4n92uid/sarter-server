import { AuthenticationError } from "apollo-server-express";
import { Request } from "express";
import passport = require("passport");
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import { getRepository } from "typeorm";

import Activity from "../Entity/Activity/Activity";
import User from "../Entity/User/User";
import Logger from "./Logger";

export function setupAuthStrategy(app) {
  const tokenStrategy = new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET
    },
    (payload, cb) => {
      getRepository(User)
        .findOne(payload.id)
        .then(user => cb(null, user))
        .catch(err => cb(err));
    }
  );

  passport.use(tokenStrategy);

  app.use(passport.initialize());
}

export async function checkCredentials(req: Request): Promise<User> {
  const { username, password } = req.body;

  const user = await getRepository(User).findOne({ where: { username } });
  const appVer = req.header("x-app-version");

  const activityFields = {
    ip: req.ip
  };

  if (user) {
    if (
      user.isPasswordValid(password) ||
      process.env.NODE_ENV === "development"
    ) {
      if (!user.isActive) throw new Error("AUTH/USER_NOT_ACTIVE");

      Logger.auth.info(
        `User authenticated '${user.username}' with app v${appVer}`
      );

      await getRepository(Activity).save({
        user: user,
        level: 0,
        content: "User {0} has logged in",
        params: [user.username],
        ...activityFields
      });

      return user;
    } else {
      Logger.auth.warn(`User auth failed '${username}'`);

      await getRepository(Activity).save({
        userId: user.id,
        level: 2,
        content: "User {0} login failed: invalid password",
        params: [username],
        ...activityFields
      });

      throw new AuthenticationError("AUTH/INVALID_PASSWORD");
    }
  } else {
    Logger.auth.warn(`User not found '${username}'`);

    await getRepository(Activity).save({
      userId: null,
      level: 2,
      content: "User {0} login failed: not found",
      params: [username],
      ...activityFields
    });

    throw new AuthenticationError("AUTH/USER_NOT_FOUND");
  }
}
