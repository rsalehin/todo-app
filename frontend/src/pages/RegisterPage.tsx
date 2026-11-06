import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ApiError, register } from "../api/client";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await register({
        username: username,
        email: email,
        first_name: firstName,
        last_name: lastName,
        password: password,
      });
      navigate("/login");
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
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          First name
          <input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
        </label>
        <label>
          Last name
          <input value={lastName} onChange={(event) => setLastName(event.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button type="submit">Create account</button>
      </form>
      {error !== "" && <p role="alert">{error}</p>}
      <p>
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}

export default RegisterPage;
