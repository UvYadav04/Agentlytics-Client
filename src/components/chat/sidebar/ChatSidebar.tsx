"use client";

import { useEffect, useMemo } from "react";
import type { DatabaseConnection, Workspace } from "@/lib/types";
import {
  useGetChatsQuery,
  useGetDatabasesQuery,
  useGetDashboardsQuery,
  useGetFilesQuery,
  useGetWorkspaceChartsQuery,
  useGetWorkspaceReportsQuery,
} from "@/lib/api/apiSlice";
import SideNavPanel from "./SideNavPanel";
import ChatsDrawer from "./ChatsDrawer";
import FilesDrawer from "./FilesDrawer";
import DatabasesDrawer from "./DatabasesDrawer";
import DashboardsDrawer from "./DashboardsDrawer";
import MetricsDrawer from "./MetricsDrawer";
import ReportsDrawer from "./ReportsDrawer";
import SettingsDrawer from "./SettingsDrawer";
import type { SidebarCounts, SidebarTab } from "./types";

export default function ChatSidebar({
  workspaceId,
  workspaces,
  chatId,
  activeTab,
  drawerOpen,
  onTabChange,
  onToggleDrawer,
  onSelectWorkspace,
  onSelectChat,
  onNewChat,
  onConnectDatabase,
}: {
  workspaceId: string | null;
  workspaces: Workspace[];
  chatId: string | null;
  activeTab: SidebarTab;
  drawerOpen: boolean;
  onTabChange: (tab: SidebarTab) => void;
  onToggleDrawer: () => void;
  onSelectWorkspace: (id: string) => void;
  onSelectChat: (id: string | null) => void;
  onNewChat: () => void;
  onConnectDatabase: (reconnectTarget?: DatabaseConnection | null) => void;
}) {
  // Queries to power live counts on items
  const { data: chats = [] } = useGetChatsQuery(workspaceId ?? "", { skip: !workspaceId });
  const { data: files = [] } = useGetFilesQuery(workspaceId ?? "", { skip: !workspaceId });
  const { data: databases = [] } = useGetDatabasesQuery(workspaceId ?? "", { skip: !workspaceId });
  const { data: dashboards = [] } = useGetDashboardsQuery(workspaceId ?? "", { skip: !workspaceId });
  const { data: charts = [] } = useGetWorkspaceChartsQuery(workspaceId ?? "", { skip: !workspaceId });
  const { data: reports = [] } = useGetWorkspaceReportsQuery(workspaceId ?? "", { skip: !workspaceId });

  const counts: SidebarCounts = {
    chats: chats.length,
    files: files.length,
    databases: databases.length,
    dashboards: dashboards.length,
    metrics: charts.length,
    reports: reports.length,
  };

  // Keyboard shortcuts: Ctrl+B / Cmd+B for toggle drawer, Ctrl+N / Cmd+N for new chat
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key.toLowerCase() === "b") {
        e.preventDefault();
        onToggleDrawer();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === "n") {
        e.preventDefault();
        onNewChat();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggleDrawer, onNewChat]);

  function handleSelectTab(tab: SidebarTab) {
    if (tab === "home") {
      onSelectChat(null);
      if (drawerOpen) {
        onToggleDrawer();
      }
      return;
    }

    if (activeTab === tab) {
      // Clicking the already-active tab toggles the drawer
      onToggleDrawer();
    } else {
      onTabChange(tab);
      if (!drawerOpen) {
        onToggleDrawer();
      }
    }
  }

  return (
    <div className="flex h-full shrink-0">
      {/* 1. Primary Navigation Sidepanel (Compressed / Icons Only) */}
      <SideNavPanel
        activeTab={activeTab}
        drawerOpen={drawerOpen}
        chatId={chatId}
        counts={counts}
        onToggleDrawer={onToggleDrawer}
        onSelectTab={handleSelectTab}
        onNewChat={onNewChat}
      />

      {/* 2. Secondary Sub-Drawer Panel */}
      <aside
        className={`relative flex h-full flex-col border-r border-border bg-card shadow-sm transition-all duration-200 ease-in-out ${
          drawerOpen ? "w-72 sm:w-80 opacity-100" : "w-0 opacity-0 overflow-hidden pointer-events-none"
        }`}
      >
        {workspaceId ? (
          <div className="flex h-full w-72 sm:w-80 flex-col">
            {activeTab === "chats" && (
              <ChatsDrawer
                workspaceId={workspaceId}
                selectedId={chatId}
                onSelect={(id) => onSelectChat(id)}
                onClose={onToggleDrawer}
              />
            )}

            {activeTab === "dashboards" && (
              <DashboardsDrawer
                workspaceId={workspaceId}
                onClose={onToggleDrawer}
              />
            )}

            {activeTab === "files" && (
              <FilesDrawer
                workspaceId={workspaceId}
                onClose={onToggleDrawer}
              />
            )}

            {activeTab === "databases" && (
              <DatabasesDrawer
                workspaceId={workspaceId}
                onConnect={onConnectDatabase}
                onClose={onToggleDrawer}
              />
            )}

            {activeTab === "metrics" && (
              <MetricsDrawer
                workspaceId={workspaceId}
                onClose={onToggleDrawer}
              />
            )}

            {activeTab === "reports" && (
              <ReportsDrawer
                workspaceId={workspaceId}
                onClose={onToggleDrawer}
              />
            )}

            {activeTab === "settings" && (
              <SettingsDrawer
                selectedId={workspaceId}
                onSelect={onSelectWorkspace}
                onClose={onToggleDrawer}
              />
            )}
          </div>
        ) : (
          <div className="flex h-full w-72 sm:w-80 flex-col items-center justify-center p-4 text-center text-xs text-muted">
            <p>Please select or create a workspace to view content.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
