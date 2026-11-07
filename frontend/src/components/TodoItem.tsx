import { useState } from "react";
import type { Todo } from "../api/types";
import TodoForm from "./TodoForm";
import type { TodoFormValues } from "./TodoForm";

type TodoItemProps = {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onSave: (todo: Todo, values: TodoFormValues) => Promise<boolean>;
  onDelete: (todo: Todo) => void;
};

// One todo in the list: shown normally, or as an edit form after clicking "Edit".
function TodoItem({ todo, onToggle, onSave, onDelete }: TodoItemProps) {
  const [editing, setEditing] = useState(false);

  async function handleSave(values: TodoFormValues): Promise<boolean> {
    const saved = await onSave(todo, values);
    if (saved) {
      setEditing(false);
    }
    return saved;
  }

  if (editing) {
    return (
      <li>
        <TodoForm
          initialValues={{
            title: todo.title,
            description: todo.description,
            priority: todo.priority,
          }}
          submitLabel="Save"
          onSubmit={handleSave}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

    return (
    <li>
      <label>
        <input type="checkbox" checked={todo.complete} onChange={() => onToggle(todo)} />
        {todo.title}
      </label>{" "}
      — {todo.description} (priority {todo.priority}){" "}
      {/* aria-label: the button shows "Edit", but screen readers and tests hear which todo. */}
      <button type="button" aria-label={`Edit ${todo.title}`} onClick={() => setEditing(true)}>
        Edit
      </button>
      <button type="button" aria-label={`Delete ${todo.title}`} onClick={() => onDelete(todo)}>
        Delete
      </button>
    </li>
  );
}

export default TodoItem;
