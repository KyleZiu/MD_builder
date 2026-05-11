import type { Task, LLMConfig } from "@/types";
import { toast } from "@/components/ui/toast";

const API_BASE = "/api";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function listTasks(
  status?: string,
  limit = 50,
  offset = 0
): Promise<Task[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  const res = await fetch(`${API_BASE}/tasks?${params}`);
  return handleResponse<Task[]>(res);
}

export async function createTask(
  file: File,
  llmConfigId?: string
): Promise<Task> {
  const form = new FormData();
  form.append("file", file);
  if (llmConfigId) form.append("llm_config_id", llmConfigId);
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    body: form,
  });
  return handleResponse<Task>(res);
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  toast({
    title: "成功",
    description: "任务已删除",
  });
}

export async function downloadTask(id: string, filename: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${id}/download`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function listConfigs(): Promise<LLMConfig[]> {
  const res = await fetch(`${API_BASE}/configs`);
  return handleResponse<LLMConfig[]>(res);
}

export async function createConfig(
  config: Omit<LLMConfig, "id" | "created_at"> & { api_key: string }
): Promise<LLMConfig> {
  const res = await fetch(`${API_BASE}/configs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  return handleResponse<LLMConfig>(res);
}

export async function updateConfig(
  id: string,
  config: Partial<LLMConfig> & { api_key?: string }
): Promise<LLMConfig> {
  const res = await fetch(`${API_BASE}/configs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  return handleResponse<LLMConfig>(res);
}

export async function deleteConfig(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/configs/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
}
