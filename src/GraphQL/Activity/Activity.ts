import { gql } from "apollo-server-express";
import { endOfDay, parseISO, startOfDay } from "date-fns";
import { isNil } from "lodash";
import { Between, getRepository, MoreThan } from "typeorm";

import Activity from "../../Entity/Activity/Activity";
import { logCrudAction } from "../../Utils/Check";
import { paginationResponse } from "../../Utils/ResponseHelper";
import { Context } from "../../Utils/Context";

export const ActivityTypeDefs = gql`
  type Activity {
    id: ID!
    createdAt: String
    user: User
    level: Int
    content: String
    params: [String]
    ip: String
    hostname: String
    machineId: String
  }

  type ActivityPagination {
    nodes: [Activity]
    pagination: PaginationInfo
  }

  input ActivityFilter {
    date: String!
    limit: Int!
    page: Int!
    minLevel: Int
    userId: ID
  }

  extend type Query {
    listActivity(filter: ActivityFilter): ActivityPagination
  }
`;

export const ActivityResolvers = {
  Query: {
    listActivity: async (parent, args, ctx: Context, info) => {
      logCrudAction(args, ctx, info);

      const filter = args.filter;

      const where = {
        createdAt: Between(
          startOfDay(parseISO(filter.date)),
          endOfDay(parseISO(filter.date))
        )
      };

      if (!isNil(filter.minLevel)) {
        where["level"] = MoreThan(filter.minLevel);
      }

      if (ctx.user.isGranted("ADMIN")) {
        if (!isNil(filter.userId)) where["userId"] = filter.userId;
      } else {
        where["userId"] = ctx.user.id;
      }

      const [rows, count] = await getRepository(Activity).findAndCount({
        where,
        take: filter.limit,
        skip: (filter.page - 1) * filter.limit
      });

      return paginationResponse(rows, count, filter.limit);
    }
  }
};
