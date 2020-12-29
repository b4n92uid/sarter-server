import yargs from "yargs";

import DbBackup from "./Commands/DB/DbBackup";
import DbDrop from "./Commands/DB/DbDrop";
import DbInit from "./Commands/DB/DbInit";
import DbMigrate from "./Commands/DB/DbMigrate";
import DbRestore from "./Commands/DB/DbRestore";
import DbSeed from "./Commands/DB/DbSeed";
import UserResetPassword from "./Commands/User/UserResetPassword";

require("dotenv").config();

yargs
  .scriptName("cli")
  .usage("$0 <cmd> [args]")
  .command(DbInit)
  .command(DbSeed)
  .command(DbDrop)
  .command(DbMigrate)
  .command(DbBackup)
  .command(DbRestore)
  .command(UserResetPassword)
  .demandCommand()
  .help().argv;
