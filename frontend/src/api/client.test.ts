import { expect, test, vi } from "vitest";
import { saveToken } from "../auth/token";
import { jsonResponse } from "../test/responses";
import { ApiError, getMe, login, register } from "./client";

test("login sends form data and returns the token", async () => {
  const fakeFetch = vi
    .fn()
    .mockResolvedValue(jsonResponse(200, { access_token: "abc", token_type: "bearer" }));
  vi.stubGlobal("fetch", fakeFetch);

  const token = await login("alice", "secret-123");

  expect(token).toBe("abc");
  const [url, options] = fakeFetch.mock.calls[0];
  expect(url).toBe("/api/auth/token");
  expect(options.body.toString()).toBe("username=alice&password=secret-123");
});

test("a failed request becomes an ApiError with the backend's message", async () => {
  const fakeFetch = vi
    .fn()
    .mockResolvedValue(jsonResponse(409, { detail: "Username or email already taken" }));
  vi.stubGlobal("fetch", fakeFetch);

  const attempt = register({
    username: "alice",
    email: "alice@example.com",
    first_name: "Alice",
    last_name: "Smith",
    password: "correct-horse-battery",
  });

  await expect(attempt).rejects.toThrow("Username or email already taken");
  await expect(attempt).rejects.toBeInstanceOf(ApiError);
});

test("a validation error shows the first message", async () => {
  const body = { detail: [{ loc: ["body", "email"], msg: "value is not a valid email address" }] };
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(422, body)));

  const attempt = register({
    username: "alice",
    email: "nope",
    first_name: "Alice",
    last_name: "Smith",
    password: "correct-horse-battery",
  });

  await expect(attempt).rejects.toThrow("value is not a valid email address");
});

test("getMe sends the saved token", async () => {
  saveToken("abc");
  const fakeFetch = vi.fn().mockResolvedValue(jsonResponse(200, { username: "alice" }));
  vi.stubGlobal("fetch", fakeFetch);

  await getMe();

  const [url, options] = fakeFetch.mock.calls[0];
  expect(url).toBe("/api/users/me");
  expect(options.headers).toEqual({ Authorization: "Bearer abc" });
});
