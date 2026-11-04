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
    <div className="flex h-full flex-col bg-[#13151b] text-[#d1d5db]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e212b] px-4 py-3.5">
        <span className="text-sm font-bold tracking-tight text-white">Settings & Workspaces</span>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="rounded-lg p-1 text-[#9ca3af] hover:bg-white/[0.08] hover:text-white"
          title="Close drawer"
        >
          <PanelLeftClose className="size-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#6b7280]">
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
                      ? "bg-[#1f2330] font-semibold text-white ring-1 ring-white/10"
                      : "border border-[#252836] bg-[#191c25] text-[#d1d5db] hover:border-accent/40 hover:bg-[#1d212c] hover:text-white"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isSelected ? "bg-accent text-white" : "bg-[#252836] text-[#9ca3af]"
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
        <div className="border-t border-[#1e212b] pt-3">
          {creating ? (
            <form
              className="flex flex-col gap-2 rounded-xl border border-accent/40 bg-[#191c25] p-3"
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
              <span className="text-xs font-semibold text-white">Create New Workspace</span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Workspace name..."
                className="w-full rounded-lg border border-[#2b2f3e] bg-[#13151b] px-3 py-1.5 text-xs text-white outline-none focus:border-accent"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setName("");
                  }}
                  className="rounded-lg px-2.5 py-1 text-xs text-[#9ca3af] hover:text-white"
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
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#292d3c] py-2.5 text-xs font-semibold text-[#9ca3af] transition-colors hover:border-accent hover:bg-accent/10 hover:text-white"
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

