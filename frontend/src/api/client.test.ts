import { expect, test, vi } from "vitest";
import { saveToken } from "../auth/token";
import { jsonResponse } from "../test/responses";
import {
  ApiError,
  deleteAnyTodo,
  deleteTodo,
  getMe,
  listAllTodos,
  listTodos,
  login,
  register,
} from "./client";

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

test("listTodos puts limit and offset in the query string", async () => {
  saveToken("abc");
  const fakeFetch = vi.fn().mockResolvedValue(jsonResponse(200, []));
  vi.stubGlobal("fetch", fakeFetch);

  await listTodos(5, 10);

  const [url] = fakeFetch.mock.calls[0];
  expect(url).toBe("/api/todos?limit=5&offset=10");
});

test("deleteTodo sends DELETE and accepts an empty 204 response", async () => {
  saveToken("abc");
  const fakeFetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fakeFetch);

  await deleteTodo(7);

  const [url, options] = fakeFetch.mock.calls[0];
  expect(url).toBe("/api/todos/7");
  expect(options.method).toBe("DELETE");
});

test("the admin functions call the admin endpoints", async () => {
  saveToken("abc");
  const fakeFetch = vi
    .fn()
    .mockResolvedValueOnce(jsonResponse(200, []))
    .mockResolvedValueOnce(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fakeFetch);

  await listAllTodos();
  await deleteAnyTodo(7);

  expect(fakeFetch.mock.calls[0][0]).toBe("/api/admin/todos");
  expect(fakeFetch.mock.calls[1][0]).toBe("/api/admin/todos/7");
  expect(fakeFetch.mock.calls[1][1].method).toBe("DELETE");
});
