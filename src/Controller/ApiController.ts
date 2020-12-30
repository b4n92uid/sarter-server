import { Router } from 'express';
import passport = require('passport');
import { getRepository } from 'typeorm';

import User from '../Entity/User/User';

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
  passport.authenticate(
    "jwt",
    { session: false },
    authCallback(req, res, next)
  )(req, res, next);

ApiController.use("/api", async (req, res, next) => {
  const repo = getRepository(User);

  if (process.env.NODE_ENV === "development") {
    req.user = await repo.findOne();
    return next();
  }

  authMiddleware(req, res, next);
});

export default ApiController;
