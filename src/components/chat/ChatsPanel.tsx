"use client";

import { useCreateChatMutation, useGetChatsQuery } from "@/lib/api/apiSlice";
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
  onSelect: (id: string) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const { data: chats = [] } = useGetChatsQuery(workspaceId);
  const [createChat, { isLoading: creating }] = useCreateChatMutation();

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
          <li key={c.id}>
            <button
              onClick={() => onSelect(c.id)}
              className={`flex w-full items-center gap-2 truncate rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                c.id === selectedId
                  ? "bg-accent-soft font-medium text-accent-dark"
                  : "text-text hover:bg-bg"
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
          </li>
        ))}
      </ul>
    </SidebarSection>
  );
}
