import { render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import App from "./App";

afterEach(() => {
  // Put the real fetch back after each test.
  vi.unstubAllGlobals();
});

test("shows ok when the API is healthy", async () => {
  const fakeFetch = vi.fn().mockResolvedValue(new Response('{"status": "ok"}', { status: 200 }));
  vi.stubGlobal("fetch", fakeFetch);

  render(<App />);

  expect(await screen.findByText("API status: ok")).toBeInTheDocument();
  expect(fakeFetch).toHaveBeenCalledWith("/api/health");
});

test("shows unreachable when the server can't be reached", async () => {
  const fakeFetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
  vi.stubGlobal("fetch", fakeFetch);

  render(<App />);

  expect(await screen.findByText("API status: unreachable")).toBeInTheDocument();
});
