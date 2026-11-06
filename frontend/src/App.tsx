import { useEffect, useState } from "react";

function App() {
  const [apiStatus, setApiStatus] = useState("checking...");

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch("/api/health");
        if (response.ok) {
          setApiStatus("ok");
        } else {
          setApiStatus(`error ${response.status}`);
        }
      } catch {
        setApiStatus("unreachable");
      }
    }

    void checkHealth();
  }, []);

  return (
    <main>
      <h1>Todo App</h1>
      <p>API status: {apiStatus}</p>
    </main>
  );
}

export default App;
