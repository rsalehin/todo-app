// Where the login token lives in the browser.
// sessionStorage survives a page reload and is cleared when the tab is closed.
const TOKEN_KEY = "todo_app_token";

export function saveToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}
