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
      className={`relative flex h-full shrink-0 flex-col justify-between border-r border-[#1e2029] bg-[#0e1015] py-3.5 text-[#9ca3af] transition-all duration-300 ease-in-out select-none z-20 ${
        isExpanded ? "w-60 px-3" : "w-16 px-2 items-center"
      }`}
    >
      {/* Top Section */}
      <div className="flex w-full flex-col gap-3">
        {/* Header with Hamburger ≡ and Workspace name */}
        <div
          className={`flex items-center ${
            isExpanded ? "justify-between px-1.5" : "justify-center"
          }`}
        >
          <button
            onClick={onToggleExpand}
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9ca3af] transition-colors hover:bg-white/[0.08] hover:text-white"
            title="Toggle sidebar (Ctrl+B)"
          >
            <Menu className="size-5" />
          </button>

          {isExpanded && (
            <div className="flex min-w-0 flex-1 items-center justify-between pl-2.5">
              <span className="truncate text-xs font-semibold tracking-wide text-white">
                {currentWorkspace?.name ?? "Agentlytics"}
              </span>
              <button
                onClick={onNewChat}
                title="New chat (Ctrl+N)"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/20 text-accent transition-colors hover:bg-accent hover:text-white"
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
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent transition-all hover:bg-accent hover:text-white hover:shadow-md"
            >
              <Plus className="size-5" />
            </button>
            <div className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-[#1f222d] px-2.5 py-1 text-xs font-medium text-white shadow-xl group-hover:flex z-50 items-center gap-1.5 border border-[#2e3240]">
              <span>New Chat</span>
              <span className="rounded bg-white/20 px-1 py-0.5 text-[9px]">Ctrl+N</span>
            </div>
          </div>
        )}

        <div className="my-0.5 h-px w-full bg-[#1e2029]" />

        {/* Navigation Items (Exact Datadog/Console layout) */}
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
                      ? "bg-[#1e212b] text-white font-medium shadow-sm ring-1 ring-white/10"
                      : "text-[#9ca3af] hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {/* Left: Icon + Label */}
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon
                      className={`size-5 shrink-0 transition-colors ${
                        isActive
                          ? "text-accent"
                          : "text-[#9ca3af] group-hover:text-white"
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
                              ? "bg-accent/25 text-accent"
                              : "bg-[#1a1d26] text-[#9ca3af]"
                          }`}
                        >
                          {item.count > 99 ? "99+" : item.count}
                        </span>
                      )}
                      {item.hasChevron && (
                        <ChevronRight
                          className={`size-4 shrink-0 transition-transform ${
                            isActive
                              ? "text-white translate-x-0.5"
                              : "text-[#5b6170] group-hover:text-[#9ca3af]"
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
                          : "bg-[#252834] text-[#9ca3af]"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>

                {/* Tooltip for Compact Mode */}
                {!isExpanded && (
                  <div className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-[#1f222d] px-2.5 py-1 text-xs font-medium text-white shadow-xl group-hover:flex z-50 items-center gap-1.5 border border-[#2e3240]">
                    <span>{item.label}</span>
                    {typeof item.count === "number" && item.count > 0 && (
                      <span className="rounded-full bg-accent/25 px-1.5 py-0.2 text-[10px] text-accent">
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
      <div className="flex w-full flex-col gap-1 pt-2 border-t border-[#1e2029]">
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
                ? "bg-[#1e212b] text-white font-medium ring-1 ring-white/10"
                : "text-[#9ca3af] hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <Settings
                className={`size-5 shrink-0 ${
                  activeTab === "settings" && drawerOpen
                    ? "text-accent"
                    : "text-[#9ca3af] group-hover:text-white"
                }`}
              />
              {isExpanded && (
                <span className="truncate text-xs tracking-tight">Settings</span>
              )}
            </div>
            {isExpanded && (
              <ChevronRight className="size-4 shrink-0 text-[#5b6170] group-hover:text-[#9ca3af]" />
            )}
          </button>

          {!isExpanded && (
            <div className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-[#1f222d] px-2.5 py-1 text-xs font-medium text-white shadow-xl group-hover:flex z-50 items-center gap-1.5 border border-[#2e3240]">
              <span>Settings</span>
            </div>
          )}
        </div>

        {/* User Profile */}
        {user && (
          <Link
            href="/profile"
            aria-label="Profile"
            className={`flex w-full items-center rounded-xl transition-colors hover:bg-white/[0.06] ${
              isExpanded ? "gap-3 px-3 py-2" : "h-11 justify-center px-0"
            }`}
          >
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.picture}
                alt={user.name}
                className="h-7 w-7 rounded-full border border-white/10 object-cover shrink-0"
              />
            ) : (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
            )}
            {isExpanded && (
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate text-xs font-medium text-white">
                  {user.name}
                </div>
                <div className="truncate text-[10px] text-[#6b7280]">
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

