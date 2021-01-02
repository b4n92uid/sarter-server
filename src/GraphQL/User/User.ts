import {
  ApolloError,
  ForbiddenError,
  gql,
  UserInputError
} from "apollo-server-express";
import { getRepository } from "typeorm";

import User from "../../Entity/User/User";
import { Context } from "../../Utils/Context";
import {
  paginationClause,
  paginationResponse
} from "../../Utils/ResponseHelper";

export const UserTypeDefs = gql`
  type User {
    id: ID
    fullname: String
    username: String
    avatarUrl: String
    mail: String
    phone: String
    lastLoginAt: String
    lastActivityAt: String
    lastIp: String
    createdAt: String
    updatedAt: String
    deletedAt: String
    roles: [String]
    isAdmin: Boolean
    isOnline: Boolean
    isActive: Boolean
  }

  input CreateUserInput {
    fullname: String
    username: String!
    avatar: String @upload(type: "user")
    mail: String
    phone: String
    roles: [String] = []
    isActive: Boolean
  }

  input UpdateUserInput {
    fullname: String
    avatar: String @upload(type: "user")
    mail: String
    phone: String
    roles: [String]
    isActive: Boolean
  }

  input UserFilter {
    page: Int = 1
    limit: Int = 8
    deleted: Boolean = false
  }

  type UserPagination {
    nodes: [User]
    pagination: PaginationInfo
  }

  extend type Query {
    getUser(id: ID!): User @log @auth(roles: ["USER_GET"])

    listUser(filter: UserFilter!): UserPagination
      @log
      @auth(roles: ["USER_LIST"])
  }

  extend type Mutation {
    createUser(user: CreateUserInput!): User @log @auth(roles: ["USER_CREATE"])

    updateUser(id: ID!, user: UpdateUserInput!): User
      @log
      @auth(roles: ["USER_UPDATE"])

    deleteUser(id: ID!, force: Boolean = false): Boolean
      @log
      @auth(roles: ["USER_DELETE"])

    changeUserPassword(currentPassword: String!, newPassword: String!): Boolean
  }
`;

export const UserResolvers = {
  Query: {
    getUser: async (_source, args, ctx) => {
      const user = await getRepository(User).findOne(args.id);
      return user;
    },

    listUser: async (_source, args, ctx) => {
      if (args.filter.deleted && !ctx.user.isGranted("ADMIN"))
        throw new Error("DELETED_FILTER_ACCESS_DENIED");

      const [rows, count] = await getRepository(User).findAndCount({
        withDeleted: args.filter.deleted,
        ...paginationClause(args.filter.page, args.filter.limit)
      });

      return paginationResponse(rows, count, args.filter.limit);
    }
  },

  Mutation: {
    createUser: async (_source, args, ctx: Context) => {
      const username = (args.user.username = args.user.username.toLowerCase());

      let user = await getRepository(User).findOne({
        where: { username },
        withDeleted: true
      });

      if (user)
        throw new ApolloError(
          "This username is already taken",
          "User/ALREADY_EXISTS"
        );

      if (!/^[a-z0-9]+$/.test(username) && username.length >= 3)
        throw new ApolloError(
          "The username format is invalid",
          "User/INVALID_USERNAME"
        );

      user = await getRepository(User).save(args.user);

      ctx.activity.info("User {0} has been created", [args.user.username]);

      return user;
    },

    updateUser: async (_source, args, ctx: Context) => {
      const repo = getRepository(User);
      const user = await repo.findOne(args.id);

      repo.merge(user, args.user);

      await repo.save(user);

      if (user.id !== ctx.user.id) {
        ctx.activity.warn("User {0} updated", [user.username]);
      } else {
        ctx.activity.info("User {0} updated their profile", [user.username]);
      }

      return user;
    },

    deleteUser: async (source, args, ctx: Context) => {
      const repo = getRepository(User);
      const user = await repo.findOne(args.id, { withDeleted: args.force });

      if (!user) return false;

      if (args.force) await repo.remove(user);
      else await repo.softDelete({ id: user.id });

      ctx.activity.warn("User {0} has been deleted", [user.username]);

      return true;
    },

    changeUserPassword: async (_source, args, ctx: Context) => {
      if (!ctx.user.isPasswordValid(args.currentPassword))
        throw new ForbiddenError("The current password is invalid");

      if (!args.newPassword)
        throw new UserInputError("The new password must not be empty");

      ctx.user.hashPassword(args.newPassword);

      const repo = getRepository(User);

      await repo.save(ctx.user);

      ctx.user = await repo.findOne(ctx.user.id);

      ctx.activity.warn("User {0} changed password", [ctx.user.username]);

      return ctx.user.password == User.generateHashPassword(args.newPassword);
    }
  }
};
