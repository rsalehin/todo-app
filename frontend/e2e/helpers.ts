import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

export const PASSWORD = "correct-horse-battery";

// A new username for every test, so runs never collide with earlier ones (no 409s).
export function uniqueUsername(): string {
  return "e2e-" + crypto.randomUUID().slice(0, 8);
}

export async function registerViaUi(page: Page, username: string) {
  await page.goto("/register");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Email").fill(`${username}@example.com`);
  await page.getByLabel("First name").fill("E2E");
  await page.getByLabel("Last name").fill("Tester");
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/login$/);
}

export async function loginViaUi(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

// Created before the E2E backend starts by scripts/e2e_create_admin.py (keep in sync).
export const E2E_ADMIN = { username: "e2e-admin", password: "correct-horse-battery" };

export async function logoutViaUi(page: Page) {
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
}
