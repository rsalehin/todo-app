import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { expect, test, vi } from "vitest";
import type { Todo } from "../api/types";
import { getToken, saveToken } from "../auth/token";
import { jsonResponse } from "../test/responses";
import TodosPage from "./TodosPage";

const ALICE = { id: 1, username: "alice", role: "user" };

// A tiny in-memory stand-in for the backend: it answers the requests this page makes.
function fakeBackend(todos: Todo[], me: object = ALICE) {
  return vi.fn((url: string, options?: RequestInit) => {
    const method = options?.method ?? "GET";

    if (url === "/api/users/me") {
      return Promise.resolve(jsonResponse(200, me));
    }
    if (url.startsWith("/api/todos") && method === "GET") {
      return Promise.resolve(jsonResponse(200, todos));
    }
    if (url === "/api/todos" && method === "POST") {
      const body = JSON.parse(String(options?.body));
      const created = { ...body, id: todos.length + 1, owner_id: 1 };
      todos.push(created);
      return Promise.resolve(jsonResponse(201, created));
    }
    return Promise.resolve(jsonResponse(404, { detail: "Not Found" }));
  });
}

function renderTodosPage() {
  render(
    <MemoryRouter initialEntries={["/todos"]}>
      <Routes>
        <Route path="/todos" element={<TodosPage />} />
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

test("shows who is logged in, and logging out forgets the token", async () => {
  saveToken("abc");
  vi.stubGlobal("fetch", fakeBackend([]));
  const user = userEvent.setup();
  renderTodosPage();

  expect(await screen.findByText(/Logged in as alice/)).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Log out" }));

  expect(screen.getByText("Login page")).toBeInTheDocument();
  expect(getToken()).toBeNull();
});

test("an expired token sends you back to /login", async () => {
  saveToken("expired");
  const body = { detail: "Could not validate credentials" };
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(401, body)));
  renderTodosPage();

  expect(await screen.findByText("Login page")).toBeInTheDocument();
  expect(getToken()).toBeNull();
});

test("shows my todos", async () => {
  saveToken("abc");
  const todos: Todo[] = [
    { id: 1, title: "Buy milk", description: "oat", priority: 3, completed: false, owner_id: 1 },
  ];
  vi.stubGlobal("fetch", fakeBackend(todos));
  renderTodosPage();

  expect(await screen.findByRole("checkbox", { name: "Buy milk" })).not.toBeChecked();
});

test("adding a todo sends it to the API and reloads the list", async () => {
  saveToken("abc");
  vi.stubGlobal("fetch", fakeBackend([]));
  const user = userEvent.setup();
  renderTodosPage();

  await user.type(await screen.findByLabelText("Title"), "Pay rent");
  await user.type(screen.getByLabelText("Description"), "before Friday");
  await user.click(screen.getByRole("button", { name: "Add" }));

  expect(await screen.findByRole("checkbox", { name: "Pay rent" })).toBeInTheDocument();
});
test("the Admin link is shown to admins only", async () => {
  saveToken("abc");
  vi.stubGlobal("fetch", fakeBackend([], { id: 9, username: "boss", role: "admin" }));
  renderTodosPage();

  expect(await screen.findByRole("link", { name: "Admin" })).toBeInTheDocument();
});

test("a normal user sees no Admin link", async () => {
  saveToken("abc");
  vi.stubGlobal("fetch", fakeBackend([]));
  renderTodosPage();

  expect(await screen.findByText(/Logged in as alice/)).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
});
