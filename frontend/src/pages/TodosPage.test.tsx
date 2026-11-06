import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { expect, test, vi } from "vitest";
import { getToken, saveToken } from "../auth/token";
import { jsonResponse } from "../test/responses";
import TodosPage from "./TodosPage";

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
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, { username: "alice" })));
  const user = userEvent.setup();
  renderTodosPage();

  expect(await screen.findByText("Logged in as alice")).toBeInTheDocument();

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
