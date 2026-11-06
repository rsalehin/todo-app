import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { getToken } from "./token";

// A route guard: show the page only if we have a token, otherwise go to /login.
// It's a convenience for the user, NOT security: the backend checks every request anyway.
function RequireAuth({ children }: { children: ReactNode }) {
  if (getToken() === null) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default RequireAuth;
