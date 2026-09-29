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
  dummy: boolean;
  pages_done: number | null;
  pages_total: number | null;
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
  csv_file_ids: string[];
  files_used: string[];
  follow_up_questions: string[];
  created_at: string;
};

export type InvestigationEvent = {
  type: string;
  message: string;
  data?: Record<string, unknown>;
  at: string;
};

export type PendingQuestion = {
  question_id: string;
  question: string;
  options: string[];
  asked_by: string;
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

export type DatabaseType = "mongodb" | "postgresql";

export type RememberOption = "always" | "30d" | "7d" | "never";

export type DatabaseConnectionStatus = "connected" | "failed" | "expired";

export type DatabaseSchemaField = {
  name: string;
  type: string;
  nullable?: boolean;
  primary_key?: boolean;
  presence?: number;
};

export type DatabaseForeignKey = {
  columns: string[];
  references: string;
  referenced_columns: string[];
};

export type DatabaseSchemaObject = {
  schema: string | null;
  name: string;
  kind: string;
  row_count: number | null;
  sampled?: number;
  fields: DatabaseSchemaField[];
  foreign_keys: DatabaseForeignKey[];
};

export type DatabaseSchema = {
  database: string | null;
  server_version: string | null;
  objects: DatabaseSchemaObject[];
  truncated: boolean;
};

export type DatabaseConnection = {
  id: string;
  workspace_id: string;
  name: string;
  db_type: DatabaseType;
  display_uri: string;
  host: string;
  database: string | null;
  remember: RememberOption;
  expires_at: string | null;
  status: DatabaseConnectionStatus;
  warnings: string[];
  last_error: string | null;
  object_count: number;
  schema_refreshed_at: string | null;
  created_by: string;
  created_at: string;
};

export type DatabaseConnectionDetail = DatabaseConnection & {
  schema: DatabaseSchema;
};

export type DatabaseTestResult = {
  ok: boolean;
  db_type: DatabaseType;
  display_uri: string | null;
  host: string | null;
  database: string | null;
  server_version: string | null;
  schema: DatabaseSchema | null;
  warnings: string[];
  error: string | null;
};
