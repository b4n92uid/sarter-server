import { gql } from "apollo-server-express";
import { getConnection, getRepository } from "typeorm";

import { connectToDatabase } from "../../Utils/Database/Connect";
import User from "../../Entity/User/User";
import { apolloFetch } from "../../Test/Common";

require("dotenv").config();

let userId = null;
const userName = "test1";

beforeAll(async () => {
  await connectToDatabase();

  await getRepository(User).update({ username: "admin" }, { password: null });
});

test("Add a user", async () => {
  const { data, errors } = await apolloFetch({
    query: gql`
      mutation($user: CreateUserInput!) {
        createUser(user: $user) {
          id
          fullname
          username
          name
          avatarUrl
          mail
          phone
          lastLoginAt
          lastActivityAt
          lastMachineId
          lastIp
          createdAt
          updatedAt
          deletedAt
          roles
          isAdmin
          isOnline
          isActive
        }
      }
    `,
    variables: {
      user: {
        username: userName,
        fullname: "Test Created"
      }
    }
  });

  expect(errors).toBeUndefined();

  expect(data.createUser).not.toBeNull();

  userId = data.createUser.id;

  expect(data.createUser.username).toBe(userName);
  expect(data.createUser.fullname).toBe("Test Created");
});

test("Get a user", async () => {
  const { data } = await apolloFetch({
    query: gql`
      query($id: ID!) {
        getUser(id: $id) {
          id
          username
          fullname
        }
      }
    `,
    variables: {
      id: userId
    }
  });

  expect(data.getUser).not.toBeNull();
  expect(data.getUser.id).toBe(userId);
  expect(data.getUser.username).toBe(userName);
  expect(data.getUser.fullname).toBe("Test Created");
});

test("Update a user", async () => {
  const changes = {
    fullname: "Test Updated"
  };

  const { data } = await apolloFetch({
    query: gql`
      mutation($id: ID!, $user: UpdateUserInput!) {
        updateUser(id: $id, user: $user) {
          id
          username
          fullname
        }
      }
    `,
    variables: {
      id: userId,
      user: {
        ...changes
      }
    }
  });

  expect(data.updateUser).not.toBeNull();
  expect(data.updateUser.id).toBe(userId);
  expect(data.updateUser.fullname).toBe(changes.fullname);
});

test("Delete a user", async () => {
  const { data } = await apolloFetch({
    query: gql`
      mutation($id: ID!) {
        deleteUser(id: $id, force: true)
      }
    `,
    variables: {
      id: userId
    }
  });

  expect(data.deleteUser).toBe(true);
});

test("Change user password", async () => {
  const { data, errors } = await apolloFetch({
    query: gql`
      mutation {
        changeUserPassword(currentPassword: "", newPassword: "0000")
      }
    `
  });

  expect(errors).toBeUndefined();

  expect(data.changeUserPassword).toBe(true);
});

test("Change user password (Wrong current)", async () => {
  const { errors } = await apolloFetch({
    query: gql`
      mutation {
        changeUserPassword(currentPassword: "1111", newPassword: "0000")
      }
    `
  });

  expect(errors.length).toBeGreaterThanOrEqual(1);
  expect(errors[0].extensions.code).toBe("FORBIDDEN");
});

afterAll(async () => {
  await getRepository(User).update({ username: "admin" }, { password: null });

  await getConnection().close();
});
