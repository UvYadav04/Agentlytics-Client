"use client";

import { useState } from "react";
import {
  useCreateChatMutation,
  useDeleteChatMutation,
  useGetChatsQuery,
  useRenameChatMutation,
} from "@/lib/api/apiSlice";
import SidebarSection from "./SidebarSection";

export default function ChatsPanel({
  workspaceId,
  selectedId,
  onSelect,
  open,
  onToggle,
}: {
  workspaceId: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const { data: chats = [] } = useGetChatsQuery(workspaceId);
  const [createChat, { isLoading: creating }] = useCreateChatMutation();
  const [renameChat] = useRenameChatMutation();
  const [deleteChat] = useDeleteChatMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  function startRename(id: string, currentTitle: string) {
    setEditingId(id);
    setDraftTitle(currentTitle);
  }

  async function commitRename(id: string) {
    const title = draftTitle.trim();
    setEditingId(null);
    if (!title) return;
    await renameChat({ chatId: id, workspaceId, title }).unwrap().catch(() => {});
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this chat? Its messages, charts, and any files only used here will be deleted too.")) {
      return;
    }
    await deleteChat({ chatId: id, workspaceId }).unwrap().catch(() => {});
    if (id === selectedId) onSelect(null);
  }

  return (
    <SidebarSection
      title="Chats"
      count={chats.length}
      dotColor="bg-teal"
      open={open}
      onToggle={onToggle}
    >
      <button
        disabled={creating}
        onClick={async () => {
          const chat = await createChat({ workspaceId }).unwrap();
          onSelect(chat.id);
        }}
        className="mb-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-semibold text-muted transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent-dark disabled:opacity-40"
      >
        + New chat
      </button>

      <ul className="max-h-72 space-y-1 overflow-y-auto">
        {chats.length === 0 && (
          <li className="px-1.5 py-2 text-xs text-muted">
            No chats yet
          </li>
        )}
        {chats.map((c) => (
          <li
            key={c.id}
            className={`group flex items-center gap-1 rounded-lg pr-1 transition-colors ${
              c.id === selectedId ? "bg-accent-soft" : "hover:bg-bg"
            }`}
          >
            {editingId === c.id ? (
              <input
                autoFocus
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onBlur={() => commitRename(c.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(c.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="min-w-0 flex-1 rounded-lg bg-bg px-2.5 py-1.5 text-sm outline-none ring-1 ring-accent"
              />
            ) : (
              <button
                onClick={() => onSelect(c.id)}
                className={`flex min-w-0 flex-1 items-center gap-2 truncate px-2.5 py-1.5 text-left text-sm ${
                  c.id === selectedId ? "font-medium text-accent-dark" : "text-text"
                }`}
                title={c.title}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    c.id === selectedId ? "bg-accent" : "bg-border"
                  }`}
                />
                <span className="truncate">{c.title}</span>
              </button>
            )}

            {editingId !== c.id && (
              <span className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
                <button
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-muted hover:bg-accent-soft hover:text-accent-dark"
                  title="Rename"
                  onClick={(e) => {
                    e.stopPropagation();
                    startRename(c.id, c.title);
                  }}
                >
                  &#9998;
                </button>
                <button
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-muted hover:bg-rust/15 hover:text-rust"
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(c.id);
                  }}
                >
                  &times;
                </button>
              </span>
            )}
          </li>
        ))}
      </ul>
    </SidebarSection>
  );
}
