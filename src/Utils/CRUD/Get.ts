import { checkCrudAction, CRUD_OP, logCrudAction } from "./Check";
import { QueryOptions } from "./OperationInterface";
import { getRepository } from "typeorm";

export async function simpleGetResult(EntityModel, args) {
  return getRepository(EntityModel).findOne(args.id);
}

export function makeGetOperation(EntityModel, options?: QueryOptions) {
  return async (_source, args, ctx, info) => {
    logCrudAction(args, ctx, info);

    options = {
      operation: simpleGetResult,
      ...options
    };

    checkCrudAction(EntityModel, ctx.user, CRUD_OP.GET);
    return options.operation(EntityModel, args);
  };
}
