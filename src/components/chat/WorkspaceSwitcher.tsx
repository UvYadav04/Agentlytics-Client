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
    <div className="shrink-0 rounded-2xl  ">
      {creating ? (
        <form
          className="flex gap-1.5"
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
            className="flex-1 rounded-lg border border-accent/30 bg-card px-2.5 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={creatingWorkspace || !name.trim()}
            className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-40"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setCreating(false);
              setName("");
            }}
            className="rounded-lg px-2 py-2 text-xs text-muted hover:text-text"
            title="Cancel"
          >
            &times;
          </button>
        </form>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_-4px_rgba(204,120,92,0.5)] transition-all hover:bg-accent-dark hover:shadow-[0_6px_20px_-4px_rgba(204,120,92,0.6)]"
        >
          <span className="text-base leading-none">+</span> Create workspace
        </button>
      )}

      <div className="relative mt-2.5">
        <span className="pointer-events-none absolute left-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent" />
        <select
          value={selectedId || ""}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full appearance-none rounded-xl border border-accent/25 bg-card py-2 pl-7 pr-8 text-sm font-semibold text-text outline-none transition-colors focus:border-accent"
        >
          {workspaces.length === 0 && <option value="">No workspaces yet</option>}
          {workspaces.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-accent-dark">
          &#9662;
        </span>
      </div>
    </div>
  );
}
