"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ExternalLink,
  Link,
  MessageSquarePlus,
  MoreVertical,
  Pencil,
  Pin,
  PinOff,
  Search,
  Trash2,
  X,
} from "lucide-react";
import MoreMenu, { type MoreMenuItem } from "@/components/ui/MoreMenu";
import {
  useCreateChatMutation,
  useDeleteChatMutation,
  useGetChatsQuery,
  useRenameChatMutation,
} from "@/lib/api/apiSlice";
import type { Chat } from "@/lib/types";

function extractErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { data?: unknown } | undefined)?.data as { detail?: string } | undefined;
  return typeof data?.detail === "string" ? data.detail : fallback;
}

function pinnedStorageKey(workspaceId: string): string {
  return `quarry:pinnedChats:${workspaceId}`;
}

function readPinnedIds(workspaceId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(pinnedStorageKey(workspaceId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writePinnedIds(workspaceId: string, ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(pinnedStorageKey(workspaceId), JSON.stringify(ids));
  } catch {
    // Ignore storage quota or privacy-mode errors
  }
}

export default function ChatsDrawer({
  workspaceId,
  selectedId,
  onSelect,
}: {
  workspaceId: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onClose?: () => void;
}) {
  const { data: chats = [] } = useGetChatsQuery(workspaceId);
  const [createChat, { isLoading: creating }] = useCreateChatMutation();
  const [renameChat] = useRenameChatMutation();
  const [deleteChat, { isLoading: deleting }] = useDeleteChatMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => readPinnedIds(workspaceId));

  const renameInputRef = useRef<HTMLInputElement>(null);
  const activeEditIdRef = useRef<string | null>(null);

  useEffect(() => {
    setPinnedIds(readPinnedIds(workspaceId));
    activeEditIdRef.current = null;
    setEditingId(null);
    setConfirmingDeleteId(null);
    setErrorMessage(null);
  }, [workspaceId]);

  useEffect(() => {
    if (!editingId) return;
    renameInputRef.current?.focus();
    renameInputRef.current?.select();
  }, [editingId]);

  useEffect(() => {
    if (!copiedId) return;
    const timer = window.setTimeout(() => setCopiedId(null), 1800);
    return () => window.clearTimeout(timer);
  }, [copiedId]);

  const updatePinnedIds = useCallback(
    (updater: (prev: string[]) => string[]) => {
      setPinnedIds((prev) => {
        const next = updater(prev);
        writePinnedIds(workspaceId, next);
        return next;
      });
    },
    [workspaceId]
  );

  const togglePin = useCallback(
    (chatId: string) => {
      updatePinnedIds((prev) =>
        prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [chatId, ...prev]
      );
    },
    [updatePinnedIds]
  );

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase();
    return chats.filter((c) => c.title.toLowerCase().includes(q));
  }, [chats, searchQuery]);

  const { pinnedChats, unpinnedChats } = useMemo(() => {
    const pinnedIndex = new Map(pinnedIds.map((id, idx) => [id, idx]));
    const pinned: Chat[] = [];
    const unpinned: Chat[] = [];

    for (const chat of filteredChats) {
      if (pinnedIndex.has(chat.id)) {
        pinned.push(chat);
      } else {
        unpinned.push(chat);
      }
    }

    pinned.sort((a, b) => (pinnedIndex.get(a.id) ?? 0) - (pinnedIndex.get(b.id) ?? 0));
    return { pinnedChats: pinned, unpinnedChats: unpinned };
  }, [filteredChats, pinnedIds]);

  function startRename(id: string, currentTitle: string) {
    setConfirmingDeleteId(null);
    activeEditIdRef.current = id;
    setEditingId(id);
    setDraftTitle(currentTitle);
    setErrorMessage(null);
  }

  function cancelRename() {
    activeEditIdRef.current = null;
    setEditingId(null);
  }

  async function commitRename(chat: Chat) {
    if (activeEditIdRef.current !== chat.id) return;
    activeEditIdRef.current = null;
    const title = draftTitle.trim();
    setEditingId(null);
    if (!title || title === chat.title) return;
    try {
      await renameChat({ chatId: chat.id, workspaceId, title }).unwrap();
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, "Couldn't rename chat."));
    }
  }

  async function handleDelete(id: string) {
    setErrorMessage(null);
    try {
      await deleteChat({ chatId: id, workspaceId }).unwrap();
      updatePinnedIds((prev) => prev.filter((pinnedId) => pinnedId !== id));
      setConfirmingDeleteId(null);
      if (id === selectedId) onSelect(null);
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, "Couldn't delete chat."));
    }
  }

  async function handleCopyLink(chatId: string) {
    const url = `${window.location.origin}/chat?workspace=${encodeURIComponent(
      workspaceId
    )}&chat=${encodeURIComponent(chatId)}`;
    try {
      await navigator.clipboard?.writeText(url);
      setCopiedId(chatId);
    } catch {
      setErrorMessage("Couldn't copy chat link.");
    }
  }

  function handleOpenInNewTab(chatId: string) {
    const url = `/chat?workspace=${encodeURIComponent(workspaceId)}&chat=${encodeURIComponent(
      chatId
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
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

  function renderChatRow(c: Chat, isPinned: boolean) {
    const isSelected = c.id === selectedId;
    const isEditing = editingId === c.id;
    const isConfirmingDelete = confirmingDeleteId === c.id;

    const menuItems: MoreMenuItem[] = [
      {
        key: "pin",
        label: isPinned ? "Unpin" : "Pin",
        icon: isPinned ? PinOff : Pin,
        onSelect: () => togglePin(c.id),
      },
      {
        key: "rename",
        label: "Rename",
        icon: Pencil,
        onSelect: () => startRename(c.id, c.title),
      },
      {
        key: "copy-link",
        label: "Copy link",
        icon: Link,
        onSelect: () => handleCopyLink(c.id),
      },
      {
        key: "open-new-tab",
        label: "Open in new tab",
        icon: ExternalLink,
        onSelect: () => handleOpenInNewTab(c.id),
      },
      "separator",
      {
        key: "delete",
        label: "Delete",
        icon: Trash2,
        danger: true,
        disabled: deleting,
        onSelect: () => {
          cancelRename();
          setErrorMessage(null);
          setConfirmingDeleteId(c.id);
        },
      },
    ];

    return (
      <li
        key={c.id}
        className={`group relative rounded-xl px-2.5 py-2 transition-all ${
          isSelected
            ? "bg-accent-soft font-semibold text-accent-dark shadow-sm ring-1 ring-accent/20"
            : "text-text hover:bg-bg"
        }`}
      >
        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <input
              ref={renameInputRef}
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={() => commitRename(c)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitRename(c);
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  cancelRename();
                }
              }}
              className="min-w-0 flex-1 rounded-lg border border-accent bg-card px-2 py-1 text-xs font-normal text-text outline-none focus:ring-1 focus:ring-accent"
            />
          ) : (
            <>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                className="flex min-w-0 flex-1 items-center gap-2 truncate text-left text-xs"
                title={c.title}
              >
                {isPinned ? (
                  <Pin
                    className={`size-3 shrink-0 ${
                      isSelected ? "text-accent-dark" : "text-accent"
                    }`}
                  />
                ) : (
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      isSelected ? "bg-accent" : "bg-border"
                    }`}
                  />
                )}
                <span className="truncate">{c.title}</span>
              </button>

              {copiedId === c.id && (
                <span className="shrink-0 rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent-dark">
                  Copied
                </span>
              )}

              <MoreMenu
                items={menuItems}
                label={`More options for ${c.title}`}
                icon={MoreVertical}
                align="end"
              />
            </>
          )}
        </div>

        {isConfirmingDelete && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-rust/20 bg-rust/10 px-2.5 py-1.5 text-[11px] font-normal text-rust">
            <span className="truncate">Delete chat &amp; its items?</span>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setConfirmingDeleteId(null)}
                className="text-muted hover:text-text disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDelete(c.id)}
                className="font-bold text-rust hover:underline disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}
      </li>
    );
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
        <div className="mx-3 mt-2 rounded-xl border border-rust/20 bg-rust/10 p-2 text-xs text-rust">
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
          <div className="space-y-3">
            {pinnedChats.length > 0 && (
              <div>
                <div className="mb-1 flex items-center gap-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  <Pin className="size-2.5 text-accent" />
                  <span>Pinned</span>
                </div>
                <ul className="space-y-1">
                  {pinnedChats.map((c) => renderChatRow(c, true))}
                </ul>
              </div>
            )}

            {unpinnedChats.length > 0 && (
              <div>
                {pinnedChats.length > 0 && (
                  <div className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Recent
                  </div>
                )}
                <ul className="space-y-1">
                  {unpinnedChats.map((c) => renderChatRow(c, false))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
