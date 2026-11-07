import { expect, test } from "@playwright/test";
import {
  E2E_ADMIN,
  PASSWORD,
  loginViaUi,
  logoutViaUi,
  registerViaUi,
  uniqueUsername,
} from "./helpers.ts";

test("a normal user sees no Admin link and can't use /admin", async ({ page }) => {
  const username = uniqueUsername();
  await registerViaUi(page, username);
  await loginViaUi(page, username, PASSWORD);
  await expect(page.getByText(`Logged in as ${username}`)).toBeVisible();

  await expect(page.getByRole("link", { name: "Admin" })).toHaveCount(0);

  await page.goto("/admin");
  await expect(page.getByRole("alert")).toHaveText("This page is for admins only.");
});

test("an admin sees another user's todo and deletes it", async ({ page }) => {
  // A normal user creates a todo.
  const username = uniqueUsername();
  const title = `Plan of ${username}`;
  await registerViaUi(page, username);
  await loginViaUi(page, username, PASSWORD);
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Description").fill("made by a normal user");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByRole("checkbox", { name: title })).toBeVisible();
  await logoutViaUi(page);

  // The admin finds it on the admin page and deletes it.
  await loginViaUi(page, E2E_ADMIN.username, E2E_ADMIN.password);
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("cell", { name: title, exact: true })).toBeVisible();

  await page.getByRole("button", { name: `Delete ${title}` }).click();
  await expect(page.getByRole("cell", { name: title, exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Back to my todos" }).click();
  await logoutViaUi(page);

  // Back as the normal user: the todo is really gone.
  await loginViaUi(page, username, PASSWORD);
  await expect(page.getByText("No todos on this page.")).toBeVisible();
});
