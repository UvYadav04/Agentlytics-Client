"use client";

import { useEffect, useState } from "react";
import {
  api,
  useCancelInvestigationMutation,
  useGetActiveInvestigationQuery,
  useGetMeQuery,
  useGetWorkspacesQuery,
  useSendMessageMutation,
} from "@/lib/api/apiSlice";
import { useAppDispatch } from "@/lib/hooks";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import WorkspaceSwitcher from "@/components/chat/WorkspaceSwitcher";
import FilesPanel from "@/components/chat/FilesPanel";
import ChatsPanel from "@/components/chat/ChatsPanel";
import MessageList from "@/components/chat/MessageList";
import InputBar from "@/components/chat/InputBar";
import DashboardPanel from "@/components/chat/DashboardPanel";

export default function ChatPage() {
  const { data: user, isLoading: authLoading } = useGetMeQuery();
  const { data: workspaces = [] } = useGetWorkspacesQuery(undefined, { skip: !user });

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [liveInvestigationId, setLiveInvestigationId] = useState<string | null>(null);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const [sendMessage] = useSendMessageMutation();
  const [cancelInvestigation] = useCancelInvestigationMutation();

  // Default to the first workspace once the list loads.
  useEffect(() => {
    if (!workspaceId && workspaces.length > 0) setWorkspaceId(workspaces[0].id);
  }, [workspaces, workspaceId]);

  // On chat load, auto-reconnect to a still-running investigation instead
  // of showing an idle input (build plan Phase 5).
  const { data: activeInvestigation } = useGetActiveInvestigationQuery(chatId ?? "", {
    skip: !chatId,
  });
  useEffect(() => {
    setLiveInvestigationId(activeInvestigation?.investigation_id ?? null);
  }, [activeInvestigation]);

  function selectWorkspace(id: string) {
    setWorkspaceId(id);
    setChatId(null);
    setLiveInvestigationId(null);
  }

  function selectChat(id: string) {
    setChatId(id);
    setLimitMessage(null);
  }

  async function handleSend(content: string) {
    if (!chatId) return;
    setLimitMessage(null);
    const res = await sendMessage({ chatId, content }).unwrap();
    if (res.limited) {
      setLimitMessage(res.limit_message);
      return;
    }
    setLiveInvestigationId(res.investigation_id);
  }

  async function handleStop() {
    if (!liveInvestigationId) return;
    await cancelInvestigation(liveInvestigationId);
  }

  function handleLiveTerminal() {
    setLiveInvestigationId(null);
    if (!chatId || !workspaceId) return;
    // The worker created a new assistant Message and possibly Chart/Report
    // docs + bumped Usage counters - none of that came back as a mutation
    // response (it happened async, after the SSE stream finished), so pull
    // it in explicitly here instead of polling.
    dispatch(
      api.util.invalidateTags([
        { type: "Message", id: `LIST-${chatId}` },
        { type: "Chart", id: `WORKSPACE-${workspaceId}` },
        { type: "Dashboard", id: `LIST-${workspaceId}` },
        "Usage",
      ])
    );
  }

  if (authLoading) {
    return <div className="p-10 text-center text-muted">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted">Sign in to open your workspace.</p>
        <GoogleLoginButton />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-57px)]">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
        <WorkspaceSwitcher selectedId={workspaceId} onSelect={selectWorkspace} />
        {workspaceId && <FilesPanel workspaceId={workspaceId} />}
        {workspaceId && (
          <ChatsPanel workspaceId={workspaceId} selectedId={chatId} onSelect={selectChat} />
        )}
      </aside>

      <main className="flex flex-1 min-w-0 flex-col">
        {limitMessage && (
          <div className="bg-gold/15 text-accent-dark text-sm px-4 py-2 text-center">
            {limitMessage}
          </div>
        )}
        {chatId ? (
          <>
            <MessageList
              chatId={chatId}
              liveInvestigationId={liveInvestigationId}
              onLiveTerminal={handleLiveTerminal}
            />
            <InputBar
              disabled={!chatId}
              busy={!!liveInvestigationId}
              onSend={handleSend}
              onStop={handleStop}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted text-sm">
            Create a chat on the left to get started.
          </div>
        )}
      </main>

      {workspaceId && <DashboardPanel workspaceId={workspaceId} />}
    </div>
  );
}
