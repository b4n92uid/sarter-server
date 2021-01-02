import ApiController from "./ApiController";
import AuthController from "./AuthController";
import UploadController from "./UploadController";

export function setupServerRoutes(app) {
  app.use(AuthController);
  app.use(ApiController);
  app.use(UploadController);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err, req, res, next) => {
    return res.status(500).json({ error: err.message });
  });
}
