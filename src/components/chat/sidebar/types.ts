export type SidebarTab =
  | "home"
  | "chats"
  | "files"
  | "databases"
  | "dashboards"
  | "metrics"
  | "reports"
  | "settings"
  | null;

export interface SidebarCounts {
  chats: number;
  files: number;
  databases: number;
  dashboards: number;
  metrics: number;
  reports: number;
}
