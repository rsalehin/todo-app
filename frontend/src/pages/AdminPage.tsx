import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ApiError, deleteAnyTodo, getMe, listAllTodos } from "../api/client";
import type { Todo, UserPublic } from "../api/types";
import { clearToken } from "../auth/token";

// Every user's todos, for admins. Hiding this page from others is only a convenience:
// the backend refuses non-admins with 403 no matter what the frontend shows.
function AdminPage() {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [reloadCount, setReloadCount] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Who is this? We need the role before deciding what to show.
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

  // Load all todos, but only for admins (others would just get a 403).
  useEffect(() => {
    if (user === null || user.role !== "admin") {
      return;
    }

    async function loadAllTodos() {
      try {
        const allTodos = await listAllTodos();
        setTodos(allTodos);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Could not reach the server.");
        }
      }
    }

    void loadAllTodos();
  }, [user, reloadCount]);

  async function handleDelete(todo: Todo) {
    setError("");
    try {
      await deleteAnyTodo(todo.id);
      setReloadCount(reloadCount + 1);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Could not reach the server.");
      }
    }
  }

  if (user === null) {
    return <p>Loading...</p>;
  }

  if (user.role !== "admin") {
    return (
      <main>
        <h1>Admin</h1>
        <p role="alert">This page is for admins only.</p>
        <Link to="/todos">Back to my todos</Link>
      </main>
    );
  }

  return (
    <main>
      <h1>Admin: all todos</h1>
      <p>
        <Link to="/todos">Back to my todos</Link>
      </p>
      {error !== "" && <p role="alert">{error}</p>}
      {todos.length === 0 && <p>No todos.</p>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Owner</th>
            <th>Completed</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {todos.map((todo) => (
            <tr key={todo.id}>
              <td>{todo.id}</td>
              <td>{todo.title}</td>
              <td>user {todo.owner_id}</td>
              <td>{todo.completed ? "yes" : "no"}</td>
              <td>
                <button
                  type="button"
                  aria-label={`Delete ${todo.title}`}
                  onClick={() => handleDelete(todo)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

export default AdminPage;
