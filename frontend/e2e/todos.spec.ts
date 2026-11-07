import { expect, test } from "@playwright/test";
import { PASSWORD, loginViaUi, registerViaUi, uniqueUsername } from "./helpers.ts";

test("create, complete, edit and delete a todo", async ({ page }) => {
  const username = uniqueUsername();
  await registerViaUi(page, username);
  await loginViaUi(page, username, PASSWORD);
  await expect(page).toHaveURL(/\/todos$/);

  // Create
  await page.getByLabel("Title").fill("Buy milk");
  await page.getByLabel("Description").fill("2 litres, oat");
  await page.getByLabel("Priority").selectOption("5");
  await page.getByRole("button", { name: "Add" }).click();

  const checkbox = page.getByRole("checkbox", { name: "Buy milk" });
  await expect(checkbox).not.toBeChecked();

  // Complete. click(), not check(): check() expects the box to flip instantly, but ours
  // flips only after the API has saved the change and the list has reloaded.
  await checkbox.click();
  await expect(checkbox).toBeChecked();

  // Edit: the edit form lives inside the list item, so we look for "Title" there,
  // not in the "New todo" form at the top.
  await page.getByRole("button", { name: "Edit Buy milk" }).click();
  const item = page.getByRole("listitem");
  await item.getByLabel("Title").fill("Buy oat milk");
  await item.getByRole("button", { name: "Save" }).click();

  // The new title is shown, and the todo is still complete.
  await expect(page.getByRole("checkbox", { name: "Buy oat milk" })).toBeChecked();

  // Delete
  await page.getByRole("button", { name: "Delete Buy oat milk" }).click();
  await expect(page.getByText("No todos on this page.")).toBeVisible();
});
