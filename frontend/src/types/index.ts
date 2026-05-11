export interface Task {
  id: string;
  filename: string;
  file_type: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  error_message?: string;
  output_path?: string;
  output_size?: number;
  llm_config_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LLMConfig {
  id: string;
  name: string;
  provider: string;
  api_url: string;
  model_id: string;
  is_default: boolean;
  created_at: string;
}

export interface TaskProgressEvent {
  task_id: string;
  status: string;
  progress: number;
  message?: string;
  error_message?: string;
}
