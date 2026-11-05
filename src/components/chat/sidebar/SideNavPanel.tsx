"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Database,
  FileText,
  Files,
  Home,
  LayoutDashboard,
  LineChart,
  Menu,
  MessageSquare,
  Plus,
  Settings,
} from "lucide-react";
import type { SidebarCounts, SidebarTab } from "./types";
import type { Workspace } from "@/lib/types";
import { useGetMeQuery } from "@/lib/api/apiSlice";

interface NavItem {
  id: SidebarTab;
  label: string;
  icon: typeof Home;
  count?: number;
  hasChevron?: boolean;
}

export default function SideNavPanel({
  activeTab,
  drawerOpen,
  isExpanded,
  counts,
  currentWorkspace,
  onToggleExpand,
  onSelectTab,
  onNewChat,
}: {
  activeTab: SidebarTab;
  drawerOpen: boolean;
  isExpanded: boolean;
  counts: SidebarCounts;
  currentWorkspace?: Workspace;
  onToggleExpand: () => void;
  onSelectTab: (tab: SidebarTab) => void;
  onNewChat: () => void;
}) {
  const { data: user } = useGetMeQuery();

  const navItems: NavItem[] = useMemo(
    () => [
      { id: "home", label: "Home", icon: Home, hasChevron: false },
      {
        id: "chats",
        label: "Chats",
        icon: MessageSquare,
        count: counts.chats,
        hasChevron: true,
      },
      {
        id: "dashboards",
        label: "Dashboards",
        icon: LayoutDashboard,
        count: counts.dashboards,
        hasChevron: true,
      },
      {
        id: "files",
        label: "Files & Data",
        icon: Files,
        count: counts.files,
        hasChevron: true,
      },
      {
        id: "databases",
        label: "Databases",
        icon: Database,
        count: counts.databases,
        hasChevron: true,
      },
      {
        id: "metrics",
        label: "Metrics",
        icon: LineChart,
        count: counts.metrics,
        hasChevron: true,
      },
      {
        id: "reports",
        label: "Reports & Logs",
        icon: FileText,
        count: counts.reports,
        hasChevron: true,
      },
    ],
    [counts]
  );

  return (
    <aside
      className={`relative flex h-full shrink-0 flex-col justify-between border-r border-border bg-card py-3 text-text transition-all duration-300 ease-in-out select-none z-20 ${
        isExpanded ? "w-60 px-3" : "w-16 px-2 items-center"
      }`}
    >
      {/* Top Section */}
      <div className="flex w-full flex-col gap-2.5">
        {/* Header with Hamburger ≡ and Workspace name */}
        <div
          className={`flex items-center ${
            isExpanded ? "justify-between px-1" : "justify-center"
          }`}
        >
          <button
            onClick={onToggleExpand}
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-bg hover:text-text"
            title="Toggle sidebar (Ctrl+B)"
          >
            <Menu className="size-5" />
          </button>

          {isExpanded && (
            <div className="flex min-w-0 flex-1 items-center justify-between pl-2">
              <span className="truncate text-xs font-bold tracking-tight text-text">
                {currentWorkspace?.name ?? "Quarry"}
              </span>
              <button
                onClick={onNewChat}
                title="New chat (Ctrl+N)"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft/60 text-accent-dark transition-colors hover:bg-accent hover:text-white"
              >
                <Plus className="size-4" />
              </button>
            </div>
          )}
        </div>

        {/* Quick New Chat Button when in compact mode */}
        {!isExpanded && (
          <div className="group relative flex items-center justify-center">
            <button
              onClick={onNewChat}
              aria-label="New chat"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-accent/40 bg-accent-soft/30 text-accent-dark transition-all hover:border-accent hover:bg-accent hover:text-white hover:shadow-card active:scale-95"
            >
              <Plus className="size-5" />
            </button>
            <div className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-text px-2.5 py-1 text-xs font-medium text-white shadow-lg group-hover:flex z-50 items-center gap-1.5">
              <span>New Chat</span>
              <span className="rounded bg-white/20 px-1 py-0.5 text-[9px] text-white">Ctrl+N</span>
            </div>
          </div>
        )}

        <div className="my-0.5 h-px w-full bg-border/70" />

        {/* Navigation Items (Exact layout in Light Theme) */}
        <nav className="flex flex-col gap-1 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && drawerOpen;

            return (
              <div key={item.id} className="group relative w-full">
                <button
                  onClick={() => onSelectTab(item.id)}
                  aria-label={item.label}
                  className={`flex w-full items-center rounded-xl transition-all duration-150 ${
                    isExpanded
                      ? "justify-between px-3 py-2.5"
                      : "h-11 justify-center px-0"
                  } ${
                    isActive
                      ? "bg-accent-soft font-semibold text-accent-dark shadow-sm ring-1 ring-accent/25"
                      : "text-muted hover:bg-bg hover:text-text"
                  }`}
                >
                  {/* Left: Icon + Label */}
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon
                      className={`size-5 shrink-0 transition-colors ${
                        isActive
                          ? "text-accent-dark"
                          : "text-muted group-hover:text-text"
                      }`}
                    />
                    {isExpanded && (
                      <span className="truncate text-xs tracking-tight">
                        {item.label}
                      </span>
                    )}
                  </div>

                  {/* Right: Count Badge + Chevron > */}
                  {isExpanded && (
                    <div className="flex shrink-0 items-center gap-2">
                      {typeof item.count === "number" && item.count > 0 && (
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                            isActive
                              ? "bg-accent text-white"
                              : "bg-border text-muted"
                          }`}
                        >
                          {item.count > 99 ? "99+" : item.count}
                        </span>
                      )}
                      {item.hasChevron && (
                        <ChevronRight
                          className={`size-4 shrink-0 transition-transform ${
                            isActive
                              ? "text-accent-dark translate-x-0.5"
                              : "text-muted/60 group-hover:text-text"
                          }`}
                        />
                      )}
                    </div>
                  )}

                  {/* Compact Mode Badge */}
                  {!isExpanded && typeof item.count === "number" && item.count > 0 && (
                    <span
                      className={`absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                        isActive
                          ? "bg-accent text-white"
                          : "bg-border text-muted"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>

                {/* Tooltip for Compact Mode */}
                {!isExpanded && (
                  <div className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-text px-2.5 py-1 text-xs font-medium text-white shadow-lg group-hover:flex z-50 items-center gap-1.5">
                    <span>{item.label}</span>
                    {typeof item.count === "number" && item.count > 0 && (
                      <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] text-white">
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Settings & User Profile */}
      <div className="flex w-full flex-col gap-1 pt-2 border-t border-border/70">
        {/* Settings Item */}
        <div className="group relative w-full">
          <button
            onClick={() => onSelectTab("settings")}
            className={`flex w-full items-center rounded-xl transition-all ${
              isExpanded
                ? "justify-between px-3 py-2.5"
                : "h-11 justify-center px-0"
            } ${
              activeTab === "settings" && drawerOpen
                ? "bg-accent-soft font-semibold text-accent-dark ring-1 ring-accent/25"
                : "text-muted hover:bg-bg hover:text-text"
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <Settings
                className={`size-5 shrink-0 ${
                  activeTab === "settings" && drawerOpen
                    ? "text-accent-dark"
                    : "text-muted group-hover:text-text"
                }`}
              />
              {isExpanded && (
                <span className="truncate text-xs tracking-tight">Settings</span>
              )}
            </div>
            {isExpanded && (
              <ChevronRight className="size-4 shrink-0 text-muted/60 group-hover:text-text" />
            )}
          </button>

          {!isExpanded && (
            <div className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-text px-2.5 py-1 text-xs font-medium text-white shadow-lg group-hover:flex z-50 items-center gap-1.5">
              <span>Settings</span>
            </div>
          )}
        </div>

        {/* User Profile */}
        {user && (
          <Link
            href="/profile"
            aria-label="Profile"
            className={`flex w-full items-center rounded-xl transition-colors hover:bg-bg ${
              isExpanded ? "gap-2.5 px-3 py-2" : "h-11 justify-center px-0"
            }`}
          >
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.picture}
                alt={user.name}
                className="h-7 w-7 rounded-full border border-border object-cover shrink-0"
              />
            ) : (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-dark">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
            )}
            {isExpanded && (
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate text-xs font-medium text-text">
                  {user.name}
                </div>
                <div className="truncate text-[10px] text-muted">
                  {user.email}
                </div>
              </div>
            )}
          </Link>
        )}
      </div>
    </aside>
  );
}
