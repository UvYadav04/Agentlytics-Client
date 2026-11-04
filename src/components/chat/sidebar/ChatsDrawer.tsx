"use client";

import { useMemo, useState } from "react";
import { MessageSquarePlus, PanelLeftClose, Pencil, Search, Trash2, X } from "lucide-react";
import {
  useCreateChatMutation,
  useDeleteChatMutation,
  useGetChatsQuery,
  useRenameChatMutation,
} from "@/lib/api/apiSlice";

function extractErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { data?: unknown } | undefined)?.data as { detail?: string } | undefined;
  return typeof data?.detail === "string" ? data.detail : fallback;
}

export default function ChatsDrawer({
  workspaceId,
  selectedId,
  onSelect,
  onClose,
}: {
  workspaceId: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
}) {
  const { data: chats = [] } = useGetChatsQuery(workspaceId);
  const [createChat, { isLoading: creating }] = useCreateChatMutation();
  const [renameChat] = useRenameChatMutation();
  const [deleteChat] = useDeleteChatMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase();
    return chats.filter((c) => c.title.toLowerCase().includes(q));
  }, [chats, searchQuery]);

  function startRename(id: string, currentTitle: string) {
    setEditingId(id);
    setDraftTitle(currentTitle);
    setErrorMessage(null);
  }

  async function commitRename(id: string) {
    const title = draftTitle.trim();
    setEditingId(null);
    if (!title) return;
    try {
      await renameChat({ chatId: id, workspaceId, title }).unwrap();
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, "Couldn't rename chat."));
    }
  }

  async function handleDelete(id: string) {
    if (
      !window.confirm(
        "Delete this chat? Its messages, charts, and any files only used here will be deleted too."
      )
    ) {
      return;
    }
    try {
      await deleteChat({ chatId: id, workspaceId }).unwrap();
      if (id === selectedId) onSelect(null);
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, "Couldn't delete chat."));
    }
  }

  async function handleCreateNewChat() {
    setErrorMessage(null);
    try {
      const chat = await createChat({ workspaceId }).unwrap();
      onSelect(chat.id);
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, "Couldn't start a new chat. Please try again.")
      );
    }
  }

  return (
    <div className="flex h-full flex-col bg-card text-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-text">Chats</span>
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-dark">
            {chats.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCreateNewChat}
            disabled={creating}
            aria-label="New chat"
            className="flex h-7 items-center gap-1.5 rounded-lg bg-accent px-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-accent-dark disabled:opacity-50"
          >
            <MessageSquarePlus className="size-3.5" />
            <span>New</span>
          </button>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-lg p-1 text-muted hover:bg-bg hover:text-text"
            title="Close drawer"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="border-b border-border/70 p-3">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 size-3.5 text-muted" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full rounded-xl border border-border bg-bg/70 py-1.5 pl-8 pr-7 text-xs text-text placeholder-muted outline-none transition-colors focus:border-accent focus:bg-card focus:ring-1 focus:ring-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 rounded p-0.5 text-muted hover:text-text"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mx-3 mt-2 rounded-xl bg-rust/10 border border-rust/20 p-2 text-xs text-rust">
          {errorMessage}
        </div>
      )}

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center text-xs text-muted">
            {searchQuery ? (
              <p>No chats matching &quot;{searchQuery}&quot;</p>
            ) : (
              <>
                <p className="font-medium text-text">No chats yet</p>
                <p className="mt-1 text-[11px] text-muted">
                  Start an investigation by asking any question or creating a new chat.
                </p>
                <button
                  onClick={handleCreateNewChat}
                  disabled={creating}
                  className="mt-3 rounded-lg bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent-dark transition-colors hover:bg-accent hover:text-white"
                >
                  + Create Chat
                </button>
              </>
            )}
          </div>
        ) : (
          <ul className="space-y-1">
            {filteredChats.map((c) => {
              const isSelected = c.id === selectedId;
              const isEditing = editingId === c.id;

              return (
                <li
                  key={c.id}
                  className={`group relative flex items-center gap-1 rounded-xl px-2.5 py-2 transition-all ${
                    isSelected
                      ? "bg-accent-soft font-semibold text-accent-dark shadow-sm ring-1 ring-accent/20"
                      : "text-text hover:bg-bg"
                  }`}
                >
                  {isEditing ? (
                    <input
                      autoFocus
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      onBlur={() => commitRename(c.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(c.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="min-w-0 flex-1 rounded-lg border border-accent bg-card px-2 py-1 text-xs text-text outline-none focus:ring-1 focus:ring-accent"
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => onSelect(c.id)}
                        className="flex min-w-0 flex-1 items-center gap-2 truncate text-left text-xs"
                        title={c.title}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            isSelected ? "bg-accent" : "bg-border"
                          }`}
                        />
                        <span className="truncate">{c.title}</span>
                      </button>

                      {/* Hover Actions: Rename and Delete */}
                      <div className="hidden shrink-0 items-center gap-1 group-hover:flex">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startRename(c.id, c.title);
                          }}
                          aria-label="Rename chat"
                          className="flex h-6 w-6 items-center justify-center rounded-md text-muted hover:bg-accent-soft hover:text-accent-dark"
                          title="Rename"
                        >
                          <Pencil className="size-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(c.id);
                          }}
                          aria-label="Delete chat"
                          className="flex h-6 w-6 items-center justify-center rounded-md text-muted hover:bg-rust/20 hover:text-rust"
                          title="Delete"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
