"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { useCreateWorkspaceMutation, useGetWorkspacesQuery } from "@/lib/api/apiSlice";

export default function WorkspaceMenu({
  selectedId,
  onSelect,
  isOpen,
  onClose,
  triggerRef,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
}) {
  const { data: workspaces = [] } = useGetWorkspacesQuery();
  const [createWorkspace, { isLoading: creatingWorkspace }] = useCreateWorkspaceMutation();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute left-16 top-3 z-50 w-72 rounded-2xl border border-border bg-card p-3 shadow-xl backdrop-blur animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Workspaces
        </span>
        <button
          onClick={onClose}
          className="rounded p-0.5 text-muted hover:bg-bg hover:text-text"
          title="Close menu"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="max-h-56 space-y-1 overflow-y-auto">
        {workspaces.length === 0 && (
          <p className="px-2 py-3 text-center text-xs text-muted">No workspaces yet.</p>
        )}
        {workspaces.map((w) => {
          const isSelected = w.id === selectedId;
          const initial = w.name.slice(0, 1).toUpperCase();
          return (
            <button
              key={w.id}
              onClick={() => {
                onSelect(w.id);
                onClose();
              }}
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-sm transition-colors ${
                isSelected
                  ? "bg-accent-soft font-semibold text-accent-dark"
                  : "text-text hover:bg-bg"
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
                  {initial}
                </span>
                <span className="truncate">{w.name}</span>
              </div>
              {isSelected && <Check className="size-4 shrink-0 text-accent" />}
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 border-t border-border/80 pt-2.5">
        {creating ? (
          <form
            className="flex flex-col gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!name.trim()) return;
              try {
                const workspace = await createWorkspace(name.trim()).unwrap();
                onSelect(workspace.id);
                setName("");
                setCreating(false);
                onClose();
              } catch {
                // error handled in api layer
              }
            }}
          >
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Workspace name..."
              className="w-full rounded-xl border border-accent/40 bg-bg px-3 py-1.5 text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setName("");
                }}
                className="rounded-lg px-2.5 py-1 text-xs text-muted hover:bg-bg hover:text-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingWorkspace || !name.trim()}
                className="rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-accent-dark disabled:opacity-50"
              >
                {creatingWorkspace ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-xs font-semibold text-muted transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent-dark"
          >
            <Plus className="size-3.5" />
            <span>Create new workspace</span>
          </button>
        )}
      </div>
    </div>
  );
}

