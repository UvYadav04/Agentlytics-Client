"use client";

import { useState } from "react";
import { Database, Leaf } from "lucide-react";
import { useGetDatabasesQuery } from "@/lib/api/apiSlice";
import type { DatabaseConnection } from "@/lib/types";
import DatabaseDetailsModal from "@/components/database/DatabaseDetailsModal";
import { describeExpiry } from "@/components/database/guides";
import SidebarSection from "./SidebarSection";

const STATUS_DOT: Record<DatabaseConnection["status"], string> = {
  connected: "bg-accent",
  failed: "bg-rust",
  expired: "bg-gold",
};

export default function DatabasesPanel({
  workspaceId,
  open,
  onToggle,
  onConnect,
}: {
  workspaceId: string;
  open: boolean;
  onToggle: () => void;
  onConnect: (reconnectTarget?: DatabaseConnection) => void;
}) {
  const { data: connections = [] } = useGetDatabasesQuery(workspaceId);
  const [selected, setSelected] = useState<DatabaseConnection | null>(null);

  return (
    <>
      <SidebarSection
        title="Databases"
        count={connections.length}
        dotColor="bg-teal"
        open={open}
        onToggle={onToggle}
      >
        <button
          onClick={() => onConnect()}
          className="mb-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-semibold text-muted transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent-dark"
        >
          + Add database
        </button>

        <ul className="max-h-56 space-y-1.5 overflow-y-auto">
          {connections.length === 0 && (
            <li className="py-2 text-xs text-muted">Connect MongoDB or PostgreSQL with a read-only user.</li>
          )}
          {connections.map((connection) => {
            const Icon = connection.db_type === "mongodb" ? Leaf : Database;
            return (
              <li key={connection.id}>
                <button
                  type="button"
                  onClick={() => setSelected(connection)}
                  className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-bg"
                  title={connection.display_uri}
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[connection.status]}`} />
                  <Icon className="size-3.5 shrink-0 text-muted" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{connection.name}</span>
                    <span className="block truncate text-[10px] text-muted">
                      {connection.object_count} {connection.db_type === "mongodb" ? "collections" : "tables"} ·{" "}
                      {describeExpiry(connection.expires_at, connection.status)}
                    </span>
                  </span>
                  {connection.status !== "connected" && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onConnect(connection);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          onConnect(connection);
                        }
                      }}
                      className="shrink-0 rounded-full bg-gold/20 px-1.5 py-0.5 text-[10px] font-medium text-accent-dark hover:bg-gold/30"
                    >
                      Reconnect
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </SidebarSection>

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
    </>
  );
}
