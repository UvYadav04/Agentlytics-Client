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
    <div className="flex h-full flex-col bg-[#13151b] text-[#d1d5db]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e212b] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-white">Chats</span>
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-accent">
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
            className="rounded-lg p-1 text-[#9ca3af] hover:bg-white/[0.08] hover:text-white"
            title="Close drawer"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="border-b border-[#1e212b] p-3">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 size-3.5 text-[#6b7280]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full rounded-xl border border-[#262a38] bg-[#1a1d26] py-1.5 pl-8 pr-7 text-xs text-white placeholder-[#6b7280] outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 rounded p-0.5 text-[#9ca3af] hover:text-white"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mx-3 mt-2 rounded-xl bg-rust/20 border border-rust/30 p-2 text-xs text-rust">
          {errorMessage}
        </div>
      )}

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center text-xs text-[#9ca3af]">
            {searchQuery ? (
              <p>No chats matching &quot;{searchQuery}&quot;</p>
            ) : (
              <>
                <p className="font-medium text-white">No chats yet</p>
                <p className="mt-1 text-[11px] text-[#6b7280]">
                  Start an investigation by asking any question or creating a new chat.
                </p>
                <button
                  onClick={handleCreateNewChat}
                  disabled={creating}
                  className="mt-3 rounded-lg bg-accent/20 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
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
                      ? "bg-[#1f2330] font-semibold text-white ring-1 ring-white/10"
                      : "text-[#d1d5db] hover:bg-white/[0.05] hover:text-white"
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
                      className="min-w-0 flex-1 rounded-lg border border-accent bg-[#1a1d26] px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-accent"
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
                            isSelected ? "bg-accent" : "bg-[#3d4253]"
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
                          className="flex h-6 w-6 items-center justify-center rounded-md text-[#9ca3af] hover:bg-white/10 hover:text-white"
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
                          className="flex h-6 w-6 items-center justify-center rounded-md text-[#9ca3af] hover:bg-rust/20 hover:text-rust"
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
