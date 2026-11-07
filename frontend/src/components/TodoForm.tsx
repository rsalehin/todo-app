import { useState } from "react";
import type { FormEvent } from "react";

export type TodoFormValues = {
  title: string;
  description: string;
  priority: number;
};

const EMPTY_VALUES: TodoFormValues = { title: "", description: "", priority: 3 };

type TodoFormProps = {
  // Values to start with: empty for "create", the todo's values for "edit".
  initialValues?: TodoFormValues;
  submitLabel: string;
  // Called with the form's values. Returns true if saving worked.
  onSubmit: (values: TodoFormValues) => Promise<boolean>;
  // Only the edit form has a Cancel button.
  onCancel?: () => void;
};

// One form, used twice: to create a todo and to edit one.
function TodoForm({
  initialValues = EMPTY_VALUES,
  submitLabel,
  onSubmit,
  onCancel,
}: TodoFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [priority, setPriority] = useState(initialValues.priority);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onSubmit({ title: title, description: description, priority: priority });
    if (saved) {
      // Start again from the initial values (an empty form after "create").
      setTitle(initialValues.title);
      setDescription(initialValues.description);
      setPriority(initialValues.priority);
    }
  }

    return (
    <form onSubmit={handleSubmit}>
      <label>
        Title
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label>
        Description
        <input value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
      <label>
        Priority
        <select
          value={priority}
          // A <select>'s value is always a string; Number() turns "3" into 3.
          onChange={(event) => setPriority(Number(event.target.value))}
        >
          <option value={1}>1 (low)</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5 (high)</option>
        </select>
      </label>
      <button type="submit">{submitLabel}</button>
      {onCancel !== undefined && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}

export default TodoForm;
