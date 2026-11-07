// TypeScript versions of the backend's Pydantic schemas (app/schemas.py).
// If a page uses a field that isn't listed here, the type checker complains.

export type UserPublic = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
};

export type UserCreate = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
};

export type Token = {
  access_token: string;
  token_type: string;
};

export type Todo = {
  id: number;
  title: string;
  description: string;
  priority: number;
  completed: boolean;
  owner_id: number;
};

// What we send to create or replace a todo (TodoCreate / TodoUpdate in the backend).
export type TodoInput = {
  title: string;
  description: string;
  priority: number;
  completed: boolean;
};
