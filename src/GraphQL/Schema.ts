import { gql, makeExecutableSchema } from "apollo-server-express";

import { ActivityResolvers, ActivityTypeDefs } from "./Activity/Activity";
import { AuthDirective } from "./Directives/AuthDirective";
import { LogDirective } from "./Directives/LogDirective";
import { UploadDirective } from "./Directives/UploadDirective";
import { UserResolvers, UserTypeDefs } from "./User/User";

const Query = gql`
  scalar Upload

  directive @log on FIELD_DEFINITION
  directive @auth(roles: [String]) on FIELD_DEFINITION
  directive @upload(type: String) on INPUT_FIELD_DEFINITION

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
  resolvers: [UserResolvers, ActivityResolvers],
  schemaDirectives: {
    log: LogDirective,
    auth: AuthDirective,
    upload: UploadDirective
  }
});
