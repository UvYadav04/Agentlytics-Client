"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Database, Leaf, Loader2, RefreshCw, Trash2, X, XCircle } from "lucide-react";
import {
  useDeleteDatabaseConnectionMutation,
  useGetDatabaseQuery,
  useRefreshDatabaseSchemaMutation,
  useUpdateDatabaseConnectionMutation,
} from "@/lib/api/apiSlice";
import type { DatabaseConnection, RememberOption } from "@/lib/types";
import { DATABASE_GUIDES, REMEMBER_OPTIONS, describeExpiry } from "./guides";
import SchemaTree from "./SchemaTree";

function errorMessage(err: unknown, fallback: string) {
  const data = (err as { data?: { detail?: unknown } } | undefined)?.data;
  return typeof data?.detail === "string" ? data.detail : fallback;
}

export default function DatabaseDetailsModal({
  connection,
  onClose,
  onReconnect,
}: {
  connection: DatabaseConnection;
  onClose: () => void;
  onReconnect: (connection: DatabaseConnection) => void;
}) {
  const { data: detail, isLoading } = useGetDatabaseQuery(connection.id);
  const [refreshSchema, { isLoading: refreshing }] = useRefreshDatabaseSchemaMutation();
  const [updateConnection] = useUpdateDatabaseConnectionMutation();
  const [deleteConnection, { isLoading: deleting }] = useDeleteDatabaseConnectionMutation();
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const current = detail ?? connection;
  const guide = DATABASE_GUIDES[current.db_type];
  const Icon = current.db_type === "mongodb" ? Leaf : Database;
  const expired = current.status === "expired";

  async function refresh() {
    setError(null);
    try {
      await refreshSchema({ connectionId: connection.id, workspaceId: connection.workspace_id }).unwrap();
    } catch (err) {
      setError(errorMessage(err, "Couldn't refresh the schema."));
    }
  }

  async function changeRemember(value: RememberOption) {
    setError(null);
    try {
      await updateConnection({
        connectionId: connection.id,
        workspaceId: connection.workspace_id,
        remember: value,
      }).unwrap();
    } catch (err) {
      setError(errorMessage(err, "Couldn't update this connection."));
    }
  }

  async function remove() {
    setError(null);
    try {
      await deleteConnection({ connectionId: connection.id, workspaceId: connection.workspace_id }).unwrap();
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Couldn't remove this connection."));
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={current.name}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-dark">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold">{current.name}</h2>
              <p className="truncate font-mono text-[11px] text-muted">{current.display_uri}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-bg hover:text-text"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full bg-border px-2 py-0.5 font-medium text-muted">{guide.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 font-medium ${
                current.status === "connected"
                  ? "bg-accent-soft text-accent-dark"
                  : current.status === "failed"
                    ? "bg-rust/15 text-rust"
                    : "bg-gold/20 text-accent-dark"
              }`}
            >
              {current.status === "connected" ? "Connected" : current.status === "failed" ? "Connection failed" : "Credentials expired"}
            </span>
            <span className="text-muted">{describeExpiry(current.expires_at, current.status)}</span>
            {current.schema_refreshed_at && (
              <span className="text-muted">
                · Schema read {new Date(current.schema_refreshed_at).toLocaleString()}
              </span>
            )}
          </div>

          {(expired || current.status === "failed") && (
            <div className="flex items-start justify-between gap-3 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2.5 text-xs text-accent-dark">
              <p className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                {expired
                  ? "The saved credentials have been deleted. Paste the connection string again to reconnect."
                  : current.last_error || "The last connection attempt failed."}
              </p>
              <button
                type="button"
                onClick={() => onReconnect(current)}
                className="shrink-0 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-white hover:bg-accent-dark"
              >
                Reconnect
              </button>
            </div>
          )}

          {current.warnings.map((warning) => (
            <p key={warning} className="flex items-start gap-2 rounded-lg bg-gold/15 px-3 py-2 text-xs text-accent-dark">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              {warning}
            </p>
          ))}

          {!expired && (
            <fieldset>
              <legend className="text-xs font-semibold text-text">Remember credentials</legend>
              <div className="mt-1 grid grid-cols-4 gap-1 rounded-lg border border-border bg-bg p-1">
                {REMEMBER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => changeRemember(option.value)}
                    aria-pressed={current.remember === option.value}
                    className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                      current.remember === option.value
                        ? "bg-accent text-white shadow-card"
                        : "text-muted hover:bg-card hover:text-text"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {error && (
            <p className="flex items-start gap-2 rounded-lg border border-rust/30 bg-rust/10 px-3 py-2 text-xs text-rust">
              <XCircle className="mt-0.5 size-3.5 shrink-0" />
              {error}
            </p>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Schema</h3>
              {!expired && (
                <button
                  type="button"
                  onClick={refresh}
                  disabled={refreshing}
                  className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted transition-colors hover:border-accent hover:text-accent-dark disabled:opacity-50"
                >
                  {refreshing ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
                  {refreshing ? "Reading schema..." : "Refresh schema"}
                </button>
              )}
            </div>
            {isLoading || !detail ? (
              <div className="h-32 animate-pulse rounded-lg bg-border/30" />
            ) : (
              <SchemaTree schema={detail.schema} dbType={detail.db_type} maxHeightClass="max-h-[40vh]" />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-3">
          {confirmDelete ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted">Remove this connection and its saved credentials?</span>
              <button
                type="button"
                onClick={remove}
                disabled={deleting}
                className="rounded-full bg-rust px-3 py-1 font-medium text-white hover:bg-rust/90 disabled:opacity-50"
              >
                {deleting ? "Removing..." : "Remove"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-full px-3 py-1 text-muted hover:text-text"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1 text-xs text-muted hover:text-rust"
            >
              <Trash2 className="size-3.5" />
              Remove connection
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted hover:text-text"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
