import { expect, test } from "vitest";
import { clearToken, getToken, saveToken } from "./token";

test("a saved token can be read back and cleared", () => {
  expect(getToken()).toBeNull();

  saveToken("abc");
  expect(getToken()).toBe("abc");

  clearToken();
  expect(getToken()).toBeNull();
});
