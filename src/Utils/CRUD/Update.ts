import { camelCase } from "lodash";
import { getConnection, getRepository } from "typeorm";

import { checkCrudAction, CRUD_OP, logCrudAction } from "./Check";
import { MutationOptions } from "./OperationInterface";

export async function simpleRestoreOp(EntityModel, args) {
  const repo = getRepository(EntityModel);
  const entity = await repo.findOneOrFail(args.id, { withDeleted: true });

  await repo.restore(args.id);

  return entity;
}

export async function simpleUpdateOp(EntityModel, args) {
  const repo = getRepository(EntityModel);
  const entityName = camelCase(getConnection().getMetadata(EntityModel).name);
  const entity = await repo.findOne(args.id);

  if (!entity) return Promise.resolve(null);

  return repo.update(entity["id"], args[entityName]);
}

export function makeUpdateOperation(EntityModel, options?: MutationOptions) {
  return async (source, args, ctx) => {
    options = {
      operation: simpleUpdateOp,
      // eslint-disable-next-line
      post: () => {},
      ...options
    };

    checkCrudAction(EntityModel, ctx.user, CRUD_OP.UPDATE);
    const entity = await options.operation(EntityModel, args);
    options.post(entity, ctx, args);
    return entity;
  };
}

export function makeRestoreOperation(EntityModel, options?: MutationOptions) {
  return async (source, args, ctx, info) => {
    logCrudAction(args, ctx, info);

    options = {
      operation: simpleRestoreOp,
      // eslint-disable-next-line
      post: () => {},
      ...options
    };

    checkCrudAction(EntityModel, ctx.user, CRUD_OP.UPDATE);
    const entity = await options.operation(EntityModel, args);
    options.post(entity, ctx, args);
    return true;
  };
}
