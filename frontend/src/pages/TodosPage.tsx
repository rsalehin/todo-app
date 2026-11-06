import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ApiError, getMe } from "../api/client";
import type { UserPublic } from "../api/types";
import { clearToken } from "../auth/token";

// For now: who is logged in, and a logout button. The todo list arrives in 15b.4.
function TodosPage() {
  const [user, setUser] = useState<UserPublic | null>(null);
  const navigate = useNavigate();

  function logout() {
    // The token is simply forgotten. (A JWT can't be "switched off" on the server;
    // it stays valid until it expires, which is why its lifetime is short.)
    clearToken();
    navigate("/login");
  }

  useEffect(() => {
    async function loadUser() {
      try {
        const me = await getMe();
        setUser(me);
      } catch (err) {
        // 401: the token expired or is invalid. Forget it and log in again.
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          navigate("/login");
        }
      }
    }

    void loadUser();
  }, [navigate]);

  if (user === null) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <h1>My todos</h1>
      <p>Logged in as {user.username}</p>
      <button type="button" onClick={logout}>
        Log out
      </button>
    </main>
  );
}

export default TodosPage;
