"use client";

import { useState } from "react";
import { Database, Leaf, PanelLeftClose, Plus, RefreshCw } from "lucide-react";
import { useGetDatabasesQuery } from "@/lib/api/apiSlice";
import type { DatabaseConnection } from "@/lib/types";
import DatabaseDetailsModal from "@/components/database/DatabaseDetailsModal";
import { describeExpiry } from "@/components/database/guides";

const STATUS_DOT: Record<DatabaseConnection["status"], string> = {
  connected: "bg-teal",
  failed: "bg-rust",
  expired: "bg-gold",
};

const STATUS_TEXT: Record<DatabaseConnection["status"], string> = {
  connected: "Connected",
  failed: "Failed",
  expired: "Expired",
};

export default function DatabasesDrawer({
  workspaceId,
  onConnect,
  onClose,
}: {
  workspaceId: string;
  onConnect: (reconnectTarget?: DatabaseConnection) => void;
  onClose: () => void;
}) {
  const { data: connections = [] } = useGetDatabasesQuery(workspaceId);
  const [selected, setSelected] = useState<DatabaseConnection | null>(null);

  return (
    <div className="flex h-full flex-col bg-[#13151b] text-[#d1d5db]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e212b] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-white">Databases</span>
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-accent">
            {connections.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onConnect()}
            aria-label="Add database"
            className="flex h-7 items-center gap-1.5 rounded-lg bg-accent px-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-accent-dark"
          >
            <Plus className="size-3.5" />
            <span>Add DB</span>
          </button>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-lg p-1 text-[#9ca3af] hover:bg-white/[0.08] hover:text-white"
            title="Close drawer"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>
      </div>

      {/* Database list */}
      <div className="flex-1 overflow-y-auto p-3">
        {connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center text-xs text-[#9ca3af]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <Database className="size-6" />
            </div>
            <p className="mt-3 font-semibold text-white">No databases connected</p>
            <p className="mt-1 text-[11px] text-[#6b7280]">
              Connect PostgreSQL or MongoDB with read-only credentials to query live tables directly in chat.
            </p>
            <button
              onClick={() => onConnect()}
              className="mt-4 flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-accent-dark"
            >
              <Plus className="size-3.5" />
              <span>Connect Database</span>
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {connections.map((connection) => {
              const Icon = connection.db_type === "mongodb" ? Leaf : Database;
              const isConnected = connection.status === "connected";

              return (
                <li
                  key={connection.id}
                  className="group rounded-xl border border-[#252836] bg-[#191c25] p-3 transition-all hover:border-accent/40 hover:bg-[#1d212c]"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(connection)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelected(connection);
                      }
                    }}
                    className="cursor-pointer outline-none"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#14161f] text-[#9ca3af] group-hover:text-accent">
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-semibold text-white group-hover:text-accent">
                            {connection.name}
                          </div>
                          <div className="truncate text-[10px] text-[#9ca3af]">
                            {connection.db_type.toUpperCase()} · {connection.object_count}{" "}
                            {connection.db_type === "mongodb" ? "collections" : "tables"}
                          </div>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-full ${STATUS_DOT[connection.status]}`}
                        />
                        <span className="text-[10px] font-medium text-[#9ca3af]">
                          {STATUS_TEXT[connection.status]}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-[#252836] pt-2 text-[10px] text-[#9ca3af]">
                      <span>{describeExpiry(connection.expires_at, connection.status)}</span>

                      {!isConnected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onConnect(connection);
                          }}
                          className="flex items-center gap-1 rounded bg-gold/20 px-2 py-0.5 font-semibold text-gold hover:bg-gold/30"
                        >
                          <RefreshCw className="size-2.5" />
                          <span>Reconnect</span>
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selected && (
        <DatabaseDetailsModal
          connection={selected}
          onClose={() => setSelected(null)}
          onReconnect={(connection) => {
            setSelected(null);
            onConnect(connection);
          }}
        />
      )}
    </div>
  );
}
