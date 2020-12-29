import { camelCase } from "lodash";
import { getConnection, getRepository } from "typeorm";

import { checkCrudAction, CRUD_OP, logCrudAction } from "./Check";
import { MutationOptions } from "./OperationInterface";

export async function simpleCreateOp(EntityModel, args) {
  const entityName = camelCase(getConnection().getMetadata(EntityModel).name);
  return getRepository(EntityModel).save(args[entityName]);
}

export function makeCreateOperation(EntityModel, options?: MutationOptions) {
  return async (_source, args, ctx, info) => {
    logCrudAction(args, ctx, info);

    options = {
      operation: simpleCreateOp,
      // eslint-disable-next-line
      post: () => {},
      ...options
    };

    checkCrudAction(EntityModel, ctx.user, CRUD_OP.CREATE);
    const entity = await options.operation(EntityModel, args);
    options.post(entity, ctx, args);
    return entity;
  };
}
