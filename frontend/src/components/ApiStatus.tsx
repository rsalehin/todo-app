import { useEffect, useState } from "react";

function ApiStatus() {
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

  return <p>API status: {apiStatus}</p>;
}

export default ApiStatus;
