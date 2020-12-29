import { getRepository } from "typeorm";
import { Router } from "express";
import User from "../Entity/User/User";
import passport = require("passport");
import { startsWith } from "lodash";

const ApiController = Router();

const authCallback = (req, res, next) => (err, user) => {
  if (user) {
    user.lastActivityAt = new Date();
    getRepository(User).save(user);

    req.user = user;
  } else {
    return res.json({ access: false, error: "AUTH/ACCESS_DENIED" });
  }

  next();
};

const authMiddleware = (req, res, next) =>
  passport.authenticate("jwt", { session: false }, authCallback(req, res, next))(req, res, next);

ApiController.use("/api", async (req, res, next) => {
  const repo = getRepository(User);

  if (process.env.NODE_ENV === "development") {
    req.user = await repo.findOne();
    return next();
  }

  // Check permanent access token
  if (startsWith(req.headers["authorization"], "PAT")) {
    const token = req.headers["authorization"].split(" ")[1];
    const user = await repo
      .createQueryBuilder("u")
      .where(`JSON_CONTAINS(u.accessTokens, :token)`, { token: JSON.stringify(token) })
      .getOne();

    if (user) {
      req.user = user;
      return next();
    }
  }

  authMiddleware(req, res, next);
});

export default ApiController;
