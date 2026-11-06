import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { expect, test, vi } from "vitest";
import { getToken } from "../auth/token";
import { jsonResponse } from "../test/responses";
import LoginPage from "./LoginPage";

function renderLoginPage() {
  // MemoryRouter: a router that keeps the URL in memory instead of the address bar.
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/todos" element={<p>Todos page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

test("a successful login saves the token and opens the todos page", async () => {
  const fakeFetch = vi
    .fn()
    .mockResolvedValue(jsonResponse(200, { access_token: "abc", token_type: "bearer" }));
  vi.stubGlobal("fetch", fakeFetch);
  const user = userEvent.setup();
  renderLoginPage();

  await user.type(screen.getByLabelText("Username"), "alice");
  await user.type(screen.getByLabelText("Password"), "correct-horse-battery");
  await user.click(screen.getByRole("button", { name: "Log in" }));

  expect(await screen.findByText("Todos page")).toBeInTheDocument();
  expect(getToken()).toBe("abc");
});

test("a failed login shows the error and stays on the page", async () => {
  const fakeFetch = vi
    .fn()
    .mockResolvedValue(jsonResponse(401, { detail: "Incorrect username or password" }));
  vi.stubGlobal("fetch", fakeFetch);
  const user = userEvent.setup();
  renderLoginPage();

  await user.type(screen.getByLabelText("Username"), "alice");
  await user.type(screen.getByLabelText("Password"), "wrong-password");
  await user.click(screen.getByRole("button", { name: "Log in" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Incorrect username or password");
  expect(getToken()).toBeNull();
});
