import { getRepository } from "typeorm";

import { checkCrudAction, CRUD_OP, logCrudAction } from "./Check";
import { MutationOptions } from "./OperationInterface";

export async function simpleDeleteOp(EntityModel, args) {
  const repo = getRepository(EntityModel);
  const entity = await repo.findOneOrFail(args.id, { withDeleted: args.force });

  if (args.force) await repo.remove(entity);
  else await repo.softDelete({ id: entity["id"] });

  return entity;
}

interface DeleteOptions {
  softDelete?: boolean;
}

export function makeDeleteOperation(EntityModel, options?: MutationOptions & DeleteOptions) {
  return async (source, args, ctx, info) => {
    logCrudAction(args, ctx, info);

    options = {
      operation: simpleDeleteOp,
      softDelete: false,
      // eslint-disable-next-line
      post: (entity, ctx, args) => {},
      ...options
    };

    args.force = !options.softDelete;

    checkCrudAction(EntityModel, ctx.user, CRUD_OP.DELETE);
    const entity = await options.operation(EntityModel, args);

    if (entity !== null) {
      options.post(entity, ctx, args);
      return true;
    } else {
      return false;
    }
  };
}
