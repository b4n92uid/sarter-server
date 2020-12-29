import { gql, makeExecutableSchema } from "apollo-server-express";

import { ActivityResolvers, ActivityTypeDefs } from "./Activity/Activity";
import { UserResolvers, UserTypeDefs } from "./User/User";

const Query = gql`
  scalar Upload

  type PaginationInfo {
    nodesCount: Int
    pagesCount: Int
  }

  type Mutation {
    _empty: String
  }

  type Query {
    _empty: String
  }
`;

export default makeExecutableSchema({
  typeDefs: [Query, UserTypeDefs, ActivityTypeDefs],
  resolvers: [UserResolvers, ActivityResolvers]
});
