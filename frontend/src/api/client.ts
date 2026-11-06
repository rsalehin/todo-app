// Every call to the backend lives in this file. Pages never call fetch directly.
import { getToken } from "../auth/token";
import type { Token, UserCreate, UserPublic } from "./types";

// An error that remembers the HTTP status, so pages can react to 401, 409, 422, ...
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Turn a failed response into an ApiError with the backend's message.
async function errorFrom(response: Response): Promise<ApiError> {
  let message = `Request failed (${response.status})`;
  try {
    const body = await response.json();
    if (typeof body.detail === "string") {
      // HTTPException: {"detail": "Username or email already taken"}
      message = body.detail;
    } else if (Array.isArray(body.detail) && body.detail.length > 0) {
      // Validation error (422): {"detail": [{"loc": [...], "msg": "..."}, ...]}
      message = body.detail[0].msg;
    }
  } catch {
    // The body wasn't JSON; keep the generic message.
  }
  return new ApiError(response.status, message);
}

// The Authorization header if we have a token, otherwise no header at all.
function authHeaders(): Record<string, string> {
  const token = getToken();
  if (token === null) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

export async function register(data: UserCreate): Promise<UserPublic> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw await errorFrom(response);
  }
  return await response.json();
}

export async function login(username: string, password: string): Promise<string> {
  // The OAuth2 password flow expects FORM data, not JSON (Step 9).
  // URLSearchParams builds "username=...&password=..." and fetch sets the content type.
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);

  const response = await fetch("/api/auth/token", { method: "POST", body: form });
  if (!response.ok) {
    throw await errorFrom(response);
  }
  const data: Token = await response.json();
  return data.access_token;
}

export async function getMe(): Promise<UserPublic> {
  const response = await fetch("/api/users/me", { headers: authHeaders() });
  if (!response.ok) {
    throw await errorFrom(response);
  }
  return await response.json();
}
