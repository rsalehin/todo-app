import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ApiError, login } from "../api/client";
import { saveToken } from "../auth/token";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Stop the browser's default form submit, which would reload the whole page.
    event.preventDefault();
    setError("");

    try {
      const token = await login(username, password);
      saveToken(token);
      navigate("/todos");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Could not reach the server.");
      }
    }
  }

  return (
    <main>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button type="submit">Log in</button>
      </form>
      {error !== "" && <p role="alert">{error}</p>}
      <p>
        No account yet? <Link to="/register">Register</Link>
      </p>
    </main>
  );
}

export default LoginPage;
