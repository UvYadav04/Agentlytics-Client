"use client";

import { useState } from "react";
import { useCreateWorkspaceMutation, useGetWorkspacesQuery } from "@/lib/api/apiSlice";

export default function WorkspaceSwitcher({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { data: workspaces = [] } = useGetWorkspacesQuery();
  const [createWorkspace, { isLoading: creatingWorkspace }] = useCreateWorkspaceMutation();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  return (
    <div className="p-3 border-b border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Workspace
        </span>
        <button
          onClick={() => setCreating((v) => !v)}
          className="text-xs text-accent-dark hover:underline"
        >
          + New
        </button>
      </div>

      {creating && (
        <form
          className="mb-2 flex gap-1.5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!name.trim()) return;
            const workspace = await createWorkspace(name.trim()).unwrap();
            onSelect(workspace.id);
            setName("");
            setCreating(false);
          }}
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Workspace name"
            className="flex-1 rounded-lg border border-border bg-bg px-2 py-1 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={creatingWorkspace}
            className="rounded-lg bg-accent px-2 py-1 text-xs text-white disabled:opacity-40"
          >
            Add
          </button>
        </form>
      )}

      <select
        value={selectedId || ""}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm outline-none focus:border-accent"
      >
        {workspaces.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
    </div>
  );
}
