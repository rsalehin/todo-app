import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import type { Todo } from "../api/types";
import TodoItem from "./TodoItem";

const TODO: Todo = {
  id: 7,
  title: "Buy milk",
  description: "2 litres, oat",
  priority: 3,
  completed: false,
  owner_id: 1,
};

function renderItem() {
  const handlers = {
    onToggle: vi.fn(),
    onSave: vi.fn().mockResolvedValue(true),
    onDelete: vi.fn(),
  };
  render(
    <TodoItem
      todo={TODO}
      onToggle={handlers.onToggle}
      onSave={handlers.onSave}
      onDelete={handlers.onDelete}
    />,
  );
  return handlers;
}

test("clicking the checkbox asks to toggle this todo", async () => {
  const handlers = renderItem();
  const user = userEvent.setup();

  await user.click(screen.getByRole("checkbox", { name: "Buy milk" }));

  expect(handlers.onToggle).toHaveBeenCalledWith(TODO);
});

test("editing shows a form and saves the new values", async () => {
  const handlers = renderItem();
  const user = userEvent.setup();

  await user.click(screen.getByRole("button", { name: "Edit Buy milk" }));
  const titleField = screen.getByLabelText("Title");
  await user.clear(titleField);
  await user.type(titleField, "Buy oat milk");
  await user.click(screen.getByRole("button", { name: "Save" }));

  expect(handlers.onSave).toHaveBeenCalledWith(TODO, {
    title: "Buy oat milk",
    description: "2 litres, oat",
    priority: 3,
  });
  // After a successful save, the normal view is back.
  expect(await screen.findByRole("button", { name: "Edit Buy milk" })).toBeInTheDocument();
});

test("clicking Delete asks to delete this todo", async () => {
  const handlers = renderItem();
  const user = userEvent.setup();

  await user.click(screen.getByRole("button", { name: "Delete Buy milk" }));

  expect(handlers.onDelete).toHaveBeenCalledWith(TODO);
});
