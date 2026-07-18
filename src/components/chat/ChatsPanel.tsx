"use client";

import { useCreateChatMutation, useGetChatsQuery } from "@/lib/api/apiSlice";

export default function ChatsPanel({
  workspaceId,
  selectedId,
  onSelect,
}: {
  workspaceId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { data: chats = [] } = useGetChatsQuery(workspaceId);
  const [createChat, { isLoading: creating }] = useCreateChatMutation();

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Chats
        </span>
        <button
          disabled={creating}
          onClick={async () => {
            const chat = await createChat({ workspaceId }).unwrap();
            onSelect(chat.id);
          }}
          className="text-xs text-accent-dark hover:underline disabled:opacity-40"
        >
          + New
        </button>
      </div>
      <ul className="flex-1 min-h-0 overflow-y-auto px-2 pb-3 space-y-1">
        {chats.length === 0 && (
          <li className="px-1.5 py-2 text-xs text-muted">
            No chats yet - start one above.
          </li>
        )}
        {chats.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => onSelect(c.id)}
              className={`w-full truncate rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                c.id === selectedId
                  ? "bg-accent-soft text-accent-dark font-medium"
                  : "hover:bg-bg text-text"
              }`}
              title={c.title}
            >
              {c.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
