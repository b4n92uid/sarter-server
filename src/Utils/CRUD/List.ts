import { getRepository, SelectQueryBuilder } from "typeorm";

import { checkCrudAction, CRUD_OP, logCrudAction } from "./Check";
import { QueryOptions } from "./OperationInterface";

export function paginationClause(page: number, limit: number) {
  return {
    take: limit,
    skip: page <= 0 ? null : (page - 1) * limit
  };
}

export function paginationQuery(query: SelectQueryBuilder<any>, filter: any) {
  if (filter.limit > 0) query.take(filter.limit);

  if (filter.page > 1) query.skip((filter.page - 1) * filter.limit);
}

export function paginationResponse(nodes: Array<any>, count: number, limit: number) {
  return {
    nodes,
    pagination: {
      nodesCount: count,
      pagesCount: Math.ceil(count / limit)
    }
  };
}

export async function plainListResult(EntityModel) {
  return getRepository(EntityModel).find({
    order: { id: "DESC" }
  });
}

export async function paginatedListResult(EntityModel, args) {
  if (typeof args.filter == "undefined")
    throw new Error("`filter` argument is not defined for a paginated result");

  const { limit, page } = args.filter;

  const [rows, count] = await getRepository(EntityModel).findAndCount({
    limit: limit,
    offset: (page - 1) * limit
  });

  return paginationResponse(rows, count, limit);
}

export async function paginatedListResultFromSql(query: SelectQueryBuilder<any>, args) {
  const { limit, page } = args.filter;

  if (limit > 0) query.limit(limit);

  if (page > 1) query.offset((page - 1) * limit);

  const [nodes, count] = await query.getManyAndCount();

  return paginationResponse(nodes, count, limit);
}

export function makeListOperation(EntityModel, options?: QueryOptions) {
  return async (_source, args, ctx, info) => {
    logCrudAction(args, ctx, info);

    options = {
      operation: plainListResult,
      ...options
    };

    checkCrudAction(EntityModel, ctx.user, CRUD_OP.LIST);
    return options.operation(EntityModel, args);
  };
}
