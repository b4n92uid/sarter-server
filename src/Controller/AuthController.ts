import { Router } from "express";
import { sign } from "jsonwebtoken";
import { checkCredentials } from "../Utils/Authentication";
import Logger from "../Utils/Logger";
import passport = require("passport");

const AuthController = Router();

AuthController.get("/api/ping", (req, res) => {
  return res.json({ ping: true });
});

AuthController.post("/api/login", async (req, res) => {
  try {
    if (req.body.username === undefined || req.body.password === undefined)
      throw new Error("AUTH/MISSING_CREDENTIALS");

    const user = await checkCredentials(req);

    const token = sign({ id: user.id }, process.env.SECRET);
    return res.json({
      access: true,
      user: user,
      token
    });
  } catch (error) {
    return res.json({ access: false, error: error.message });
  }
});

AuthController.post("/api/logout", (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    Logger.auth.info(`User logout ${user.username}`);

    req.logout();
    return res.json({ access: false });
  })(req, res, next);
});

export default AuthController;
