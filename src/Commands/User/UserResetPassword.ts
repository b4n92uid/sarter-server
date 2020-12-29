import { createConnection, getConnection, getConnectionOptions, getRepository } from "typeorm";

import User from "../../Entity/User/User";
import { commandError, commandSuccess } from "../Utils/CommandResponse";

export default {
  command: "user:reset-password",
  describe: "Reset the admin user password",
  builder: {
    verbose: {
      alias: "v",
      boolean: true,
      default: false
    },
    json: {
      boolean: true,
      default: false
    }
  },
  async handler(argv) {
    try {
      await createConnection({
        ...(await getConnectionOptions()),
        logging: argv.verbose
      });

      const repo = getRepository(User);

      const user = await repo.findOneOrFail({ username: "admin" });

      user.password = null;

      await repo.save(user);

      await getConnection().close();

      commandSuccess(`☑ ADMIN user password reset success`, argv.json);
    } catch (error) {
      commandError(`💥 ADMIN user password reset error`, error, argv.json);
    }
  }
};
