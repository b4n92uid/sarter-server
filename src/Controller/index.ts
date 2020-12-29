import AuthController from "./AuthController";
import ApiController from "./ApiController";

export function setupServerRoutes(app) {
  app.use(AuthController);
  app.use(ApiController);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err, req, res, next) => {
    return res.status(500).json({ error: err.message });
  });
}
