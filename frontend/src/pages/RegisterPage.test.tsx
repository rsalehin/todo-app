import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { expect, test, vi } from "vitest";
import { jsonResponse } from "../test/responses";
import RegisterPage from "./RegisterPage";

function renderRegisterPage() {
  render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillInForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Username"), "alice");
  await user.type(screen.getByLabelText("Email"), "alice@example.com");
  await user.type(screen.getByLabelText("First name"), "Alice");
  await user.type(screen.getByLabelText("Last name"), "Smith");
  await user.type(screen.getByLabelText("Password"), "correct-horse-battery");
  await user.click(screen.getByRole("button", { name: "Create account" }));
}

test("a successful registration opens the login page", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(201, { id: 1 })));
  renderRegisterPage();

  await fillInForm();

  expect(await screen.findByText("Login page")).toBeInTheDocument();
});

test("a taken username shows the backend's message", async () => {
  const body = { detail: "Username or email already taken" };
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(409, body)));
  renderRegisterPage();

  await fillInForm();

  expect(await screen.findByRole("alert")).toHaveTextContent("Username or email already taken");
});
