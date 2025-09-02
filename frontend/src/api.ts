export type User = { id: string; email: string; name: string | null };
export type Task = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'LOW'|'MEDIUM'|'HIGH';
  createdAt: string;
  updatedAt: string;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function parseError(res: Response): Promise<never> {
  try {
    const data = await res.json();
    throw new Error((data && (data.error?.message || data.error)) || res.statusText);
  } catch {
    throw new Error(res.statusText);
  }
}

export async function register(email: string, password: string, name?: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<{ user: User; token: string }>;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<{ user: User; token: string }>;
}

function authHeaders() {
  const token = getToken();
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function fetchTasks() {
  const res = await fetch(`${API_URL}/tasks`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json() as Promise<{ tasks: Task[] }>;
}

export async function createTask(title: string, description?: string, priority: 'LOW'|'MEDIUM'|'HIGH' = 'MEDIUM') {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title, description, priority }),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json() as Promise<{ task: Task }>;
}

export async function updateTask(id: string, data: Partial<Pick<Task, "title" | "description" | "completed" | "priority">>) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json() as Promise<{ task: Task }>;
}

export async function toggleTask(id: string) {
  const res = await fetch(`${API_URL}/tasks/${id}/toggle`, { method: "PATCH", headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to toggle task");
  return res.json() as Promise<{ task: Task }>;
}

export async function deleteTask(id: string) {
  const res = await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to delete task");
}
