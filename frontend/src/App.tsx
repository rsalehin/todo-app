import { Navigate, Route, Routes } from "react-router";
import RequireAuth from "./auth/RequireAuth";
import ApiStatus from "./components/ApiStatus";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TodosPage from "./pages/TodosPage";

// Which page belongs to which URL.
function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/todos"
          element={
            <RequireAuth>
              <TodosPage />
            </RequireAuth>
          }
        />
        {/* Any other URL: go to the todos page (which sends you to /login if needed). */}
        <Route path="*" element={<Navigate to="/todos" replace />} />
      </Routes>
      <footer>
        <ApiStatus />
      </footer>
    </>
  );
}

export default App;
