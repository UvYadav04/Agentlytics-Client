export type User = {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  email_verified: boolean;
  has_password: boolean;
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
  files_used: string[];
  // 2-3 suggested next questions - only ever populated on assistant messages that went through
  // a real investigation (see shared/models/message.py's Message.follow_up_questions).
  follow_up_questions: string[];
  created_at: string;
};

export type InvestigationEvent = {
  type: string;
  message: string;
  // Backend no longer sends a data payload on tool_call/tool_result/tool_error events (see
  // analyzerEngine/agents/events.py) - everything the UI needs comes from `type` + `message`.
  // Optional since InvestigationEvent.data still defaults to {} server-side for other event
  // kinds (status/completed/error/cancelled) that DO still populate it.
  data?: Record<string, unknown>;
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
  real_time: boolean;
  file_ids: string[];
  last_refreshed_at: string | null;
};
