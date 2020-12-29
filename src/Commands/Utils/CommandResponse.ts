import { each, omit } from "lodash";

import Logger from "../../Utils/Logger";

interface CommandResponse {
  message: string;
  [key: string]: string;
}

export function commandSuccess(res: CommandResponse | string, json: boolean) {
  if (typeof res === "string") res = { message: res };

  if (json)
    console.log(
      JSON.stringify(
        {
          success: true,
          ...res
        },
        null,
        2
      )
    );
  else {
    Logger.cli.info(res.message);
    each(omit(res, "message"), (v, k) => Logger.cli.info(`${k}: ${v}`));
  }
}

export function commandError(message: string, error: Error, json: boolean) {
  if (json)
    console.log(
      JSON.stringify(
        {
          success: false,
          message,
          error
        },
        null,
        2
      )
    );
  else {
    Logger.cli.error(message);
    Logger.cli.error(error);
  }
}
