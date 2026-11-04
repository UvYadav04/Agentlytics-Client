"use client";

import { useState } from "react";
import { Check, PanelLeftClose, Plus } from "lucide-react";
import { useCreateWorkspaceMutation, useGetWorkspacesQuery } from "@/lib/api/apiSlice";
import type { Workspace } from "@/lib/types";

export default function SettingsDrawer({
  selectedId,
  onSelect,
  onClose,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const { data: workspaces = [] } = useGetWorkspacesQuery();
  const [createWorkspace, { isLoading: creatingWorkspace }] = useCreateWorkspaceMutation();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  return (
    <div className="flex h-full flex-col bg-card text-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <span className="text-sm font-bold tracking-tight text-text">Settings & Workspaces</span>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="rounded-lg p-1 text-muted hover:bg-bg hover:text-text"
          title="Close drawer"
        >
          <PanelLeftClose className="size-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted">
            <span>SWITCH WORKSPACE</span>
            <span>{workspaces.length}</span>
          </div>

          <div className="space-y-1.5">
            {workspaces.map((w: Workspace) => {
              const isSelected = w.id === selectedId;
              return (
                <button
                  key={w.id}
                  onClick={() => onSelect(w.id)}
                  className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left transition-all ${
                    isSelected
                      ? "bg-accent-soft font-semibold text-accent-dark shadow-sm ring-1 ring-accent/25"
                      : "border border-border bg-card text-text hover:border-accent/40 hover:bg-bg"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isSelected
                          ? "bg-accent text-white"
                          : "bg-border/60 text-muted"
                      }`}
                    >
                      {w.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="truncate text-xs">{w.name}</span>
                  </div>
                  {isSelected && <Check className="size-4 shrink-0 text-accent" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Create workspace form */}
        <div className="border-t border-border/70 pt-3">
          {creating ? (
            <form
              className="flex flex-col gap-2 rounded-xl border border-accent/40 bg-bg p-3"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!name.trim()) return;
                try {
                  const ws = await createWorkspace(name.trim()).unwrap();
                  onSelect(ws.id);
                  setName("");
                  setCreating(false);
                } catch {
                  // Handled by apiSlice
                }
              }}
            >
              <span className="text-xs font-semibold text-text">Create New Workspace</span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Workspace name..."
                className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-text outline-none focus:border-accent"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setName("");
                  }}
                  className="rounded-lg px-2.5 py-1 text-xs text-muted hover:text-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingWorkspace || !name.trim()}
                  className="rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
                >
                  {creatingWorkspace ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-xs font-semibold text-muted transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent-dark"
            >
              <Plus className="size-3.5" />
              <span>Create new workspace</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
