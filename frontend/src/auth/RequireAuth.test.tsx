import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { expect, test } from "vitest";
import RequireAuth from "./RequireAuth";
import { saveToken } from "./token";

function renderProtectedPage() {
  render(
    <MemoryRouter initialEntries={["/todos"]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route
          path="/todos"
          element={
            <RequireAuth>
              <p>Secret todos</p>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

test("without a token, the guard sends you to /login", () => {
  renderProtectedPage();
  expect(screen.getByText("Login page")).toBeInTheDocument();
  expect(screen.queryByText("Secret todos")).not.toBeInTheDocument();
});

test("with a token, the guard shows the page", () => {
  saveToken("abc");
  renderProtectedPage();
  expect(screen.getByText("Secret todos")).toBeInTheDocument();
});
