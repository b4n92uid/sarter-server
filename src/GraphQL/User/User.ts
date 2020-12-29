import { ApolloError, ForbiddenError, gql, UserInputError } from "apollo-server-express";
import { isNil } from "lodash";
import { getRepository, In, Not } from "typeorm";
import User, { ReservedUsername } from "../../Entity/User/User";
import { checkCrudAction, CRUD_OP, logCrudAction } from "../../Utils/CRUD/Check";
import { paginationClause, paginationResponse } from "../../Utils/CRUD/List";
import { Context } from "../../Utils/CRUD/OperationInterface";
import { handleUploadFile, removeUploadFile } from "../../Utils/Uploads";

export const UserTypeDefs = gql`
  type User {
    id: ID
    fullname: String
    username: String
    name: String
    avatarUrl: String
    mail: String
    phone: String
    lastLoginAt: String
    lastActivityAt: String
    lastMachineId: String
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
    avatar: Upload
    mail: String
    phone: String
    roles: [String] = []
    isActive: Boolean
  }

  input UpdateUserInput {
    fullname: String
    avatar: Upload
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
    getUser(id: ID!): User
    listUser(filter: UserFilter!): UserPagination
  }

  extend type Mutation {
    createUser(user: CreateUserInput!): User
    updateUser(id: ID!, user: UpdateUserInput!): User
    deleteUser(id: ID!, force: Boolean = false): Boolean

    changeUserPassword(currentPassword: String!, newPassword: String!): Boolean
  }
`;

export const UserResolvers = {
  Query: {
    getUser: async (_source, args, ctx, info) => {
      logCrudAction(args, ctx, info);
      const user = await getRepository(User).findOne(args.id);

      if (ReservedUsername.includes(user.username))
        throw new ApolloError("This user is system protected", "User/SYSTEM_USER");

      // We check permission only when we query other users
      if (user.id !== ctx.user.id) checkCrudAction(User, ctx.user, CRUD_OP.GET);
      return user;
    },

    listUser: async (_source, args, ctx, info) => {
      logCrudAction(args, ctx, info);
      checkCrudAction(User, ctx.user, CRUD_OP.LIST);

      if (args.filter.deleted && !ctx.user.isGranted("ADMIN"))
        throw new Error("DELETED_FILTER_ACCESS_DENIED");

      const [rows, count] = await getRepository(User).findAndCount({
        withDeleted: args.filter.deleted,
        where: { username: Not(In(ReservedUsername)) },
        ...paginationClause(args.filter.page, args.filter.limit)
      });

      return paginationResponse(rows, count, args.filter.limit);
    }
  },

  Mutation: {
    createUser: async (_source, args, ctx: Context, info) => {
      logCrudAction(args, ctx, info);
      checkCrudAction(User, ctx.user, CRUD_OP.CREATE);

      const username = (args.user.username = args.user.username.toLowerCase());

      if (ReservedUsername.includes(username))
        throw new ApolloError("This user is system protected", "User/SYSTEM_USER");

      let user = await getRepository(User).findOne({
        where: { username },
        withDeleted: true
      });

      if (user) throw new ApolloError("This username is already taken", "User/ALREADY_EXISTS");

      if (!/^[a-z0-9]+$/.test(username) && username.length >= 3)
        throw new ApolloError("The username format is invalid", "User/INVALID_USERNAME");

      if (args.user.avatar) args.user.avatar = await handleUploadFile("user", args.user.avatar);

      user = await getRepository(User).save(args.user);

      ctx.activity.info("User {0} has been created", [args.user.username]);

      return user;
    },

    updateUser: async (_source, args, ctx: Context, info) => {
      logCrudAction(args, ctx, info);

      const repo = getRepository(User);
      const user = await repo.findOne(args.id);

      if (ReservedUsername.includes(user.username))
        throw new ApolloError("This user is system protected", "User/SYSTEM_USER");

      if (user.id !== ctx.user.id) {
        checkCrudAction(User, ctx.user, CRUD_OP.UPDATE);
      }

      if (!isNil(args.user.avatar)) {
        args.user.avatar = await handleUploadFile("user", args.user.avatar);
      } else if (args.user.avatar === null) {
        removeUploadFile("user", user.avatar);
      }

      repo.merge(user, args.user);

      await repo.save(user);

      if (user.id !== ctx.user.id) {
        ctx.activity.warn("User {0} updated", [user.username]);
      } else {
        ctx.activity.info("User {0} updated their profile", [user.username]);
      }

      return user;
    },

    deleteUser: async (source, args, ctx: Context, info) => {
      logCrudAction(args, ctx, info);
      checkCrudAction(User, ctx.user, CRUD_OP.DELETE);

      const repo = getRepository(User);
      const user = await repo.findOne(args.id, { withDeleted: args.force });

      if (!user) return false;

      if (ReservedUsername.includes(user.username))
        throw new ApolloError("This user is system protected", "User/SYSTEM_USER");

      if (args.force) await repo.remove(user);
      else await repo.softDelete({ id: user.id });

      ctx.activity.warn("User {0} has been deleted", [user.username]);

      return true;
    },

    changeUserPassword: async (_source, args, ctx: Context, info) => {
      logCrudAction(args, ctx, info);

      if (!ctx.user.isPasswordValid(args.currentPassword))
        throw new ForbiddenError("The current password is invalid");

      if (!args.newPassword) throw new UserInputError("The new password must not be empty");

      ctx.user.hashPassword(args.newPassword);

      const repo = getRepository(User);

      await repo.save(ctx.user);

      ctx.user = await repo.findOne(ctx.user.id);

      ctx.activity.warn("User {0} changed password", [ctx.user.username]);

      return ctx.user.password == User.generateHashPassword(args.newPassword);
    }
  }
};
