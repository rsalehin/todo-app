import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  // Remove whatever a test rendered, so the next test starts with an empty page.
  cleanup();
  // Forget any saved token, and put the real fetch back.
  sessionStorage.clear();
  vi.unstubAllGlobals();
});
