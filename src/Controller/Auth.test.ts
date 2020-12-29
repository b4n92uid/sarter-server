import { httpFetch } from "../Test/Common";

test("Should return from ping check", async () => {
  const response = await httpFetch("/ping");

  expect(response.ping).toBe(true);
});

test("Should authenticate", async () => {
  const response = await httpFetch("/login", {
    method: "POST",
    body: JSON.stringify({
      username: "admin",
      password: "0000"
    })
  });

  expect(response.access).toBe(true);
  expect(response.user).toBeDefined();
  expect(response.user.id).toBeDefined();
  expect(response.token).toBeDefined();
});

test("Should authenticate fail for missing creds", async () => {
  const response = await httpFetch("/login", {
    method: "POST"
  });

  expect(response.access).toBe(false);
  expect(response.error).toBe("AUTH/MISSING_CREDENTIALS");
});

test("Should logout", async () => {
  const response = await httpFetch("/logout", {
    method: "POST"
  });

  expect(response.access).toBe(false);
});
