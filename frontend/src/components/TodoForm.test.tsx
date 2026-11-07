import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import TodoForm from "./TodoForm";

test("submits the typed values, with priority as a number, then clears", async () => {
  const onSubmit = vi.fn().mockResolvedValue(true);
  const user = userEvent.setup();
  render(<TodoForm submitLabel="Add" onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText("Title"), "Buy milk");
  await user.type(screen.getByLabelText("Description"), "2 litres, oat");
  await user.selectOptions(screen.getByLabelText("Priority"), "5");
  await user.click(screen.getByRole("button", { name: "Add" }));

  expect(onSubmit).toHaveBeenCalledWith({
    title: "Buy milk",
    description: "2 litres, oat",
    priority: 5,
  });
  expect(screen.getByLabelText("Title")).toHaveValue("");
});

test("keeps the typed values when saving failed", async () => {
  const onSubmit = vi.fn().mockResolvedValue(false);
  const user = userEvent.setup();
  render(<TodoForm submitLabel="Add" onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText("Title"), "Hi");
  await user.click(screen.getByRole("button", { name: "Add" }));

  expect(screen.getByLabelText("Title")).toHaveValue("Hi");
});
