export type User = {
  id: string;
  email: string;
  name: string;
  picture: string | null;
};

export type Workspace = {
  id: string;
  name: string;
  created_at: string;
};

export type FileStatus =
  | "pending_upload"
  | "processing"
  | "ready"
  | "failed"
  | "cancelled";

export type FileItem = {
  id: string;
  workspace_id: string;
  filename: string;
  file_type: string;
  size_bytes: number | null;
  status: FileStatus;
  uploaded_at: string;
  error: string | null;
  row_count: number | null;
  page_count: number | null;
};

export type Chat = {
  id: string;
  workspace_id: string;
  title: string;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  investigation_id: string | null;
  chart_ids: string[];
  report_id: string | null;
  created_at: string;
};

export type InvestigationEvent = {
  type: string;
  message: string;
  data: Record<string, unknown>;
  at: string;
};

export type UsageInfo = {
  messages_sent: number;
  messages_limit: number;
  charts_created: number;
  charts_limit: number;
  reports_created: number;
  reports_limit: number;
};

export type ChartDetail = {
  id: string;
  workspace_id: string;
  message_id: string;
  title: string;
  url: string;
  created_at: string;
};

export type ReportDetail = {
  id: string;
  workspace_id: string;
  message_id: string;
  title: string;
  status: string;
  format: "markdown" | "csv" | "html";
  url: string | null;
  error: string | null;
  created_at: string;
};

export type DashboardDetail = {
  id: string;
  workspace_id: string;
  name: string;
  chart_ids: string[];
  created_at: string;
  charts: { id: string; title: string; url: string }[];
};
