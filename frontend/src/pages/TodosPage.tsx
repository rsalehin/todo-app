import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ApiError, createTodo, deleteTodo, getMe, listTodos, updateTodo } from "../api/client";
import type { Todo, UserPublic } from "../api/types";
import { clearToken } from "../auth/token";
import TodoForm from "../components/TodoForm";
import type { TodoFormValues } from "../components/TodoForm";
import TodoItem from "../components/TodoItem";

const PAGE_SIZE = 5;

function TodosPage() {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [offset, setOffset] = useState(0);
  // Increase this number to ask for the list to be loaded again (after a change).
  const [reloadCount, setReloadCount] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

    function logout() {
    // The token is simply forgotten. (A JWT can't be "switched off" on the server;
    // it stays valid until it expires, which is why its lifetime is short.)
    clearToken();
    navigate("/login");
  }

  // One place that decides what an error means for the user.
  function handleApiError(err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      // The token expired or is invalid: log in again.
      logout();
    } else if (err instanceof ApiError) {
      setError(err.message);
    } else {
      setError("Could not reach the server.");
    }
  }

  // Load who is logged in, once.
  useEffect(() => {
    async function loadUser() {
      try {
        const me = await getMe();
        setUser(me);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          navigate("/login");
        }
      }
    }

    void loadUser();
  }, [navigate]);

  // Load the current page of todos: at the start, when the page changes, and after changes.
  useEffect(() => {
    async function loadTodos() {
      try {
        const page = await listTodos(PAGE_SIZE, offset);
        setTodos(page);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          navigate("/login");
        } else {
          setError("Could not load your todos.");
        }
      }
    }

    void loadTodos();
  }, [offset, reloadCount, navigate]);

  function reload() {
    setReloadCount(reloadCount + 1);
  }

   async function handleCreate(values: TodoFormValues): Promise<boolean> {
    setError("");
    try {
      await createTodo({
        title: values.title,
        description: values.description,
        priority: values.priority,
        completed: false,
      });
      reload();
      return true;
    } catch (err) {
      handleApiError(err);
      return false;
    }
  }

  async function handleToggle(todo: Todo) {
    setError("");
    try {
      // PUT replaces the whole todo, so we send every field, with "complete" flipped.
      await updateTodo(todo.id, {
        title: todo.title,
        description: todo.description,
        priority: todo.priority,
        completed: !todo.completed,
      });
      reload();
    } catch (err) {
      handleApiError(err);
    }
  }

  async function handleSave(todo: Todo, values: TodoFormValues): Promise<boolean> {
    setError("");
    try {
      await updateTodo(todo.id, {
        title: values.title,
        description: values.description,
        priority: values.priority,
        completed: todo.completed,
      });
      reload();
      return true;
    } catch (err) {
      handleApiError(err);
      return false;
    }
  }

  async function handleDelete(todo: Todo) {
    setError("");
    try {
      await deleteTodo(todo.id);
      reload();
    } catch (err) {
      handleApiError(err);
    }
  }

    if (user === null) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <h1>My todos</h1>
      <p>
        Logged in as {user.username}{" "}
        <button type="button" onClick={logout}>
          Log out
        </button>
      </p>

      <h2>New todo</h2>
      <TodoForm submitLabel="Add" onSubmit={handleCreate} />
      {error !== "" && <p role="alert">{error}</p>}

      <h2>List</h2>
      {todos.length === 0 && <p>No todos on this page.</p>}
      <ul>
        {todos.map((todo) => (
          // key: tells React which list item is which, so it updates the right one.
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        ))}
      </ul>
            <button type="button" disabled={offset === 0} onClick={() => setOffset(offset - PAGE_SIZE)}>
        Previous
      </button>{" "}
      {/* A full page might have more after it; a shorter page is the last one. */}
      <button
        type="button"
        disabled={todos.length < PAGE_SIZE}
        onClick={() => setOffset(offset + PAGE_SIZE)}
      >
        Next
      </button>
    </main>
  );
}

export default TodosPage;
