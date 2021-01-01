import { gql } from "apollo-server-express";
import { endOfDay, parseISO, startOfDay } from "date-fns";
import { isNil } from "lodash";
import { Between, getRepository, MoreThan } from "typeorm";

import Activity from "../../Entity/Activity/Activity";
import { paginationResponse } from "../../Utils/ResponseHelper";

export const ActivityTypeDefs = gql`
  type Activity {
    id: ID!
    createdAt: String
    user: User
    level: Int
    content: String
    params: [String]
    ip: String
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
      @log
      @auth(roles: ["ACTIVITY_LIST"])
  }
`;

export const ActivityResolvers = {
  Query: {
    listActivity: async (_source, args) => {
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

      if (!isNil(filter.userId)) {
        where["userId"] = filter.userId;
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
