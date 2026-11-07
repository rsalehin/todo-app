import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { expect, test, vi } from "vitest";
import type { Todo } from "../api/types";
import { saveToken } from "../auth/token";
import { jsonResponse } from "../test/responses";
import AdminPage from "./AdminPage";

const ADMIN = { id: 1, username: "boss", role: "admin" };
const ALICE = { id: 2, username: "alice", role: "user" };

// Answers the admin page's requests, like the real backend would.
function fakeBackend(me: object, todos: Todo[]) {
  return vi.fn((url: string, options?: RequestInit) => {
    const method = options?.method ?? "GET";

    if (url === "/api/users/me") {
      return Promise.resolve(jsonResponse(200, me));
    }
    if (url === "/api/admin/todos" && method === "GET") {
      return Promise.resolve(jsonResponse(200, todos));
    }
    if (url.startsWith("/api/admin/todos/") && method === "DELETE") {
      const id = Number(url.replace("/api/admin/todos/", ""));
      const index = todos.findIndex((todo) => todo.id === id);
      todos.splice(index, 1); // remove one item at that position
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    return Promise.resolve(jsonResponse(404, { detail: "Not Found" }));
  });
}

function someTodos(): Todo[] {
  return [
    { id: 1, title: "Alice's plan", description: "x", priority: 3, completed: false, owner_id: 2 },
    { id: 2, title: "Bob's plan", description: "y", priority: 1, completed: true, owner_id: 3 },
  ];
}

function renderAdminPage() {
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

test("an admin sees every user's todos", async () => {
  saveToken("abc");
  vi.stubGlobal("fetch", fakeBackend(ADMIN, someTodos()));
  renderAdminPage();

  expect(await screen.findByText("Alice's plan")).toBeInTheDocument();
  expect(screen.getByText("Bob's plan")).toBeInTheDocument();
});

test("a normal user is told the page is for admins, and no admin request is made", async () => {
  saveToken("abc");
  const fakeFetch = fakeBackend(ALICE, someTodos());
  vi.stubGlobal("fetch", fakeFetch);
  renderAdminPage();

  expect(await screen.findByRole("alert")).toHaveTextContent("This page is for admins only.");
  const urls = fakeFetch.mock.calls.map((call) => call[0]);
  expect(urls).not.toContain("/api/admin/todos");
});

test("an admin can delete any todo, and the list reloads", async () => {
  saveToken("abc");
  vi.stubGlobal("fetch", fakeBackend(ADMIN, someTodos()));
  const user = userEvent.setup();
  renderAdminPage();

  await user.click(await screen.findByRole("button", { name: "Delete Bob's plan" }));

  // waitFor retries the check until it passes (or times out): the reload takes a moment.
  await waitFor(() => {
    expect(screen.queryByText("Bob's plan")).not.toBeInTheDocument();
  });
  expect(screen.getByText("Alice's plan")).toBeInTheDocument();
});
