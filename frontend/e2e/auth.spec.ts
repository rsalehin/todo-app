import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const PASSWORD = "correct-horse-battery";

// A new username for every test, so runs never collide with earlier ones (no 409s).
function uniqueUsername(): string {
  return "e2e-" + crypto.randomUUID().slice(0, 8);
}

async function registerViaUi(page: Page, username: string) {
  await page.goto("/register");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Email").fill(`${username}@example.com`);
  await page.getByLabel("First name").fill("E2E");
  await page.getByLabel("Last name").fill("Tester");
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/login$/);
}

async function loginViaUi(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

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
