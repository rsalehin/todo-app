import { expect, test } from "@playwright/test";
import { PASSWORD, loginViaUi, registerViaUi, uniqueUsername } from "./helpers.ts";

test("register, log in, stay logged in after reload, log out", async ({ page }) => {
  const username = uniqueUsername();

  await registerViaUi(page, username);
  await loginViaUi(page, username, PASSWORD);

  await expect(page).toHaveURL(/\/todos$/);
  await expect(page.getByText(`Logged in as ${username}`)).toBeVisible();

  await page.reload();
  await expect(page.getByText(`Logged in as ${username}`)).toBeVisible();

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("a wrong password shows an error and stays on /login", async ({ page }) => {
  const username = uniqueUsername();
  await registerViaUi(page, username);

  await loginViaUi(page, username, "wrong-password");

  await expect(page.getByRole("alert")).toHaveText("Incorrect username or password");
  await expect(page).toHaveURL(/\/login$/);
});

test("visiting /todos while logged out redirects to /login", async ({ page }) => {
  await page.goto("/todos");
  await expect(page).toHaveURL(/\/login$/);
});
