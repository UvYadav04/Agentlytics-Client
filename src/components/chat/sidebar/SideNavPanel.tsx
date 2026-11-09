"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
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
import { useGetMeQuery } from "@/lib/api/apiSlice";

interface NavItem {
  id: SidebarTab;
  label: string;
  icon: typeof Home;
  count?: number;
}

export default function SideNavPanel({
  activeTab,
  drawerOpen,
  chatId,
  counts,
  onToggleDrawer,
  onSelectTab,
  onNewChat,
}: {
  activeTab: SidebarTab;
  drawerOpen: boolean;
  chatId?: string | null;
  counts: SidebarCounts;
  onToggleDrawer: () => void;
  onSelectTab: (tab: SidebarTab) => void;
  onNewChat: () => void;
}) {
  const { data: user } = useGetMeQuery();

  const navItems: NavItem[] = useMemo(
    () => [
      { id: "home", label: "Home", icon: Home },
      {
        id: "chats",
        label: "Chats",
        icon: MessageSquare,
        count: counts.chats,
      },
      {
        id: "dashboards",
        label: "Dashboards",
        icon: LayoutDashboard,
        count: counts.dashboards,
      },
      {
        id: "files",
        label: "Files & Data",
        icon: Files,
        count: counts.files,
      },
      {
        id: "databases",
        label: "Databases",
        icon: Database,
        count: counts.databases,
      },
      {
        id: "metrics",
        label: "Metrics",
        icon: LineChart,
        count: counts.metrics,
      },
      {
        id: "reports",
        label: "Reports & Logs",
        icon: FileText,
        count: counts.reports,
      },
    ],
    [counts]
  );

  return (
    <aside className="relative flex h-full w-16 shrink-0 flex-col items-center justify-between border-r border-border bg-card px-2 py-3 text-text select-none z-20">
      {/* Top Section */}
      <div className="flex w-full flex-col items-center gap-2.5">
        {/* Toggle drawer button */}
        <div className="group relative flex items-center justify-center">
          <button
            onClick={onToggleDrawer}
            aria-label="Toggle drawer"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-bg hover:text-text"
          >
            <Menu className="size-5" />
          </button>
          <div className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-text px-2.5 py-1 text-xs font-medium text-white shadow-lg group-hover:flex z-50 items-center gap-1.5">
            <span>Toggle panel</span>
            <span className="rounded bg-white/20 px-1 py-0.5 text-[9px] text-white">Ctrl+B</span>
          </div>
        </div>

        {/* Quick New Chat Button */}
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

        <div className="my-0.5 h-px w-full bg-border/70" />

        {/* Navigation Items (Icons only, with count badges and tooltips) */}
        <nav className="flex w-full flex-col gap-1 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.id === "home"
                ? !chatId
                : activeTab === item.id && drawerOpen;

            return (
              <div key={item.id} className="group relative flex w-full justify-center">
                <button
                  onClick={() => onSelectTab(item.id)}
                  aria-label={item.label}
                  className={`flex h-11 w-full items-center justify-center rounded-xl transition-all duration-150 ${
                    isActive
                      ? "bg-accent-soft font-semibold text-accent-dark shadow-sm ring-1 ring-accent/25"
                      : "text-muted hover:bg-bg hover:text-text"
                  }`}
                >
                  <Icon
                    className={`size-5 shrink-0 transition-colors ${
                      isActive
                        ? "text-accent-dark"
                        : "text-muted group-hover:text-text"
                    }`}
                  />

                  {/* Count Badge */}
                  {typeof item.count === "number" && item.count > 0 && (
                    <span
                      className={`absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                        isActive
                          ? "bg-accent text-white"
                          : "bg-border text-muted"
                      }`}
                    >
                      {item.count > 99 ? "99+" : item.count}
                    </span>
                  )}
                </button>

                {/* Tooltip on hover */}
                <div className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-text px-2.5 py-1 text-xs font-medium text-white shadow-lg group-hover:flex z-50 items-center gap-1.5">
                  <span>{item.label}</span>
                  {typeof item.count === "number" && item.count > 0 && (
                    <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] text-white">
                      {item.count}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Settings & User Profile */}
      <div className="flex w-full flex-col items-center gap-1 pt-2 border-t border-border/70">
        {/* Settings Item */}
        <div className="group relative flex w-full justify-center">
          <button
            onClick={() => onSelectTab("settings")}
            aria-label="Settings"
            className={`flex h-11 w-full items-center justify-center rounded-xl transition-all ${
              activeTab === "settings" && drawerOpen
                ? "bg-accent-soft font-semibold text-accent-dark ring-1 ring-accent/25"
                : "text-muted hover:bg-bg hover:text-text"
            }`}
          >
            <Settings
              className={`size-5 shrink-0 ${
                activeTab === "settings" && drawerOpen
                  ? "text-accent-dark"
                  : "text-muted group-hover:text-text"
              }`}
            />
          </button>

          <div className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-text px-2.5 py-1 text-xs font-medium text-white shadow-lg group-hover:flex z-50 items-center gap-1.5">
            <span>Settings</span>
          </div>
        </div>

        {/* User Profile */}
        {user && (
          <div className="group relative flex w-full justify-center">
            <Link
              href="/profile"
              aria-label="Profile"
              className="flex h-11 w-full items-center justify-center rounded-xl transition-colors hover:bg-bg"
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
            </Link>

            <div className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-text px-2.5 py-1 text-xs font-medium text-white shadow-lg group-hover:flex z-50 items-center gap-1.5">
              <span>{user.name}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
