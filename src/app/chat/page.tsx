"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  api,
  useCancelInvestigationMutation,
  useCreateChatMutation,
  // useGetActiveInvestigationQuery, - unused now that auto-reconnect below is disabled
  useGetChatsQuery,
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
import ChatLanding from "@/components/chat/ChatLanding";
import DashboardPanel, { type RightSection } from "@/components/chat/DashboardPanel";

export default function ChatPage() {
  // useSearchParams needs a Suspense boundary around it in the app router.
  return (
    <Suspense fallback={null}>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: user, isLoading: authLoading } = useGetMeQuery();
  const { data: workspaces = [] } = useGetWorkspacesQuery(undefined, { skip: !user });

  // Seeded from the URL (?workspace=...&chat=...) so a chart/dashboard link
  // opened from a message, then closed via the browser's back button, lands
  // back on the exact chat the user was in - see the sync effect below,
  // which keeps the URL current as workspaceId/chatId change. Without this,
  // navigating to /chart/[id] and back fully remounts this page and these
  // would reset to null, dropping the user on the empty landing state
  // instead of where they were.
  const [workspaceId, setWorkspaceId] = useState<string | null>(searchParams.get("workspace"));
  const [chatId, setChatId] = useState<string | null>(searchParams.get("chat"));
  const [liveInvestigationId, setLiveInvestigationId] = useState<string | null>(null);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [startingChat, setStartingChat] = useState(false);
  // Optimistic echo of the user's own message - shown the instant they hit
  // send, instead of waiting on the round trip + the getMessages refetch it
  // triggers (see handleSend/handleStartChat). Cleared only once that
  // refetch has actually landed, so it hands off to the real message
  // without a flash or a duplicate bubble.
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  // Date.now() from the moment the user hit send - drives the elapsed-time
  // readout in MessageList/InvestigationTrail. Set alongside pendingMessage,
  // but stays set for the WHOLE investigation (through liveInvestigationId
  // streaming) rather than being cleared with it - only cleared once the
  // investigation reaches a terminal state (handleLiveTerminal), hits the
  // usage limit, errors out, or the user switches chats/workspaces.
  const [requestStartedAt, setRequestStartedAt] = useState<number | null>(null);

  // Accordion state for the left (Files/Chats) and right (Dashboards/Charts)
  // sidebars - only one section per side is open at a time, and both can be
  // collapsed to null.
  const [leftSection, setLeftSection] = useState<"files" | "chats" | null>(null);
  const [rightSection, setRightSection] = useState<RightSection>(null);

  const dispatch = useAppDispatch();
  const [sendMessage] = useSendMessageMutation();
  const [cancelInvestigation] = useCancelInvestigationMutation();
  const [createChat] = useCreateChatMutation();

  // Default to the first workspace once the list loads.
  useEffect(() => {
    if (!workspaceId && workspaces.length > 0) setWorkspaceId(workspaces[0].id);
  }, [workspaces, workspaceId]);

  // Mirror the current selection into the URL (replace, not push, so
  // switching chats doesn't spam browser history) - this is what makes the
  // back button from /chart/[id] or /dashboard/[id] land back on the right
  // chat instead of the empty landing state, since this page reads its
  // initial state from these same params on mount.
  useEffect(() => {
    const params = new URLSearchParams();
    if (workspaceId) params.set("workspace", workspaceId);
    if (chatId) params.set("chat", chatId);
    const qs = params.toString();
    router.replace(qs ? `/chat?${qs}` : "/chat", { scroll: false });
  }, [workspaceId, chatId, router]);

  // On chat load, auto-reconnect to a still-running investigation instead
  // of showing an idle input (build plan Phase 5).
  //
  // Disabled per request: on refresh, the chat itself still reopens (URL
  // sync effect above), but a still-running investigation no longer
  // auto-resumes its live SSE stream/timer - the chat just shows idle
  // until the user sends a new message, even if a previous investigation
  // is technically still running server-side. Re-enable by uncommenting
  // both the query and the effect below.
  // const { data: activeInvestigation } = useGetActiveInvestigationQuery(chatId ?? "", {
  //   skip: !chatId,
  // });
  // useEffect(() => {
  //   setLiveInvestigationId(activeInvestigation?.investigation_id ?? null);
  // }, [activeInvestigation]);

  // For the header bar's chat title - RTK Query dedupes this against
  // ChatsPanel's identical query, so it's not an extra network request.
  const { data: chats = [] } = useGetChatsQuery(workspaceId ?? "", { skip: !workspaceId });
  const activeChatTitle = chats.find((c) => c.id === chatId)?.title;

  function selectWorkspace(id: string) {
    setWorkspaceId(id);
    setChatId(null);
    setLiveInvestigationId(null);
    setRequestStartedAt(null);
    // Otherwise a message sent right before switching away would still be
    // "pending" when MessageList mounts for whatever's selected next, and
    // its optimistic-echo effect would append that stale text there instead.
    setPendingMessage(null);
  }

  function selectChat(id: string | null) {
    setChatId(id);
    setLiveInvestigationId(null);
    setLimitMessage(null);
    setRequestStartedAt(null);
    setPendingMessage(null);
  }

  async function handleSend(content: string, fileIds: string[]) {
    if (!chatId) return;
    setLimitMessage(null);
    setPendingMessage(content);
    setRequestStartedAt(Date.now());
    try {
      const res = await sendMessage({ chatId, content, fileIds }).unwrap();
      if (res.limited) {
        setLimitMessage(res.limit_message);
        setRequestStartedAt(null);
      } else {
        setLiveInvestigationId(res.investigation_id);
      }
      // Pull the just-created user message into the cache before dropping
      // the optimistic bubble above, so the handoff is invisible.
      await dispatch(api.endpoints.getMessages.initiate(chatId, { forceRefetch: true }));
    } catch (err) {
      setRequestStartedAt(null);
      throw err;
    } finally {
      setPendingMessage(null);
    }
  }

  async function handleStop() {
    if (!liveInvestigationId) return;
    await cancelInvestigation(liveInvestigationId);
  }

  // Used by ChatLanding's centered input: typing a message with no chat
  // selected creates one on the fly and sends the message in the same step,
  // instead of making the user click "New chat" first.
  async function handleStartChat(content: string) {
    if (!workspaceId || startingChat) return;
    setStartingChat(true);
    setPendingMessage(content);
    setRequestStartedAt(Date.now());
    try {
      const chat = await createChat({ workspaceId }).unwrap();
      setChatId(chat.id);
      setLimitMessage(null);
      const res = await sendMessage({ chatId: chat.id, content }).unwrap();
      if (res.limited) {
        setLimitMessage(res.limit_message);
        setRequestStartedAt(null);
      } else {
        setLiveInvestigationId(res.investigation_id);
      }
      await dispatch(api.endpoints.getMessages.initiate(chat.id, { forceRefetch: true }));
    } catch (err) {
      setRequestStartedAt(null);
      throw err;
    } finally {
      setStartingChat(false);
      setPendingMessage(null);
    }
  }

  async function handleNewChat() {
    if (!workspaceId) return;
    const chat = await createChat({ workspaceId }).unwrap();
    selectChat(chat.id);
  }

  function handleLiveTerminal() {
    setLiveInvestigationId(null);
    setRequestStartedAt(null);
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
    return (
      <div className="flex h-[calc(100vh-57px)] items-center justify-center text-sm text-muted">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-57px)] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
          <span className="h-3 w-3 rounded-full bg-accent" />
        </div>
        <p className="text-muted">Sign in to open your workspace.</p>
        <GoogleLoginButton label="Log in" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-57px)] bg-bg">
      <aside className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto p-3">
        <WorkspaceSwitcher selectedId={workspaceId} onSelect={selectWorkspace} />
        {workspaceId && (
          <FilesPanel
            workspaceId={workspaceId}
            open={leftSection === "files"}
            onToggle={() => setLeftSection((s) => (s === "files" ? null : "files"))}
          />
        )}
        {workspaceId && (
          <ChatsPanel
            workspaceId={workspaceId}
            selectedId={chatId}
            onSelect={selectChat}
            open={leftSection === "chats"}
            onToggle={() => setLeftSection((s) => (s === "chats" ? null : "chats"))}
          />
        )}
      </aside>

      <main className="flex flex-1 min-w-0 flex-col">
        {/* {chatId && (
          <div className="flex items-center gap-2 border-b border-border bg-card px-6 py-3">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="truncate text-sm font-medium">{activeChatTitle}</span>
            {liveInvestigationId && (
              <span className="ml-auto flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent-dark">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                Investigating
              </span>
            )}
          </div>
        )} */}

        {limitMessage && (
          <div className="border-b border-border bg-gold/15 px-4 py-2 text-center text-sm text-accent-dark">
            {limitMessage}
          </div>
        )}

        {chatId ? (
          <>
            <MessageList
              chatId={chatId}
              liveInvestigationId={liveInvestigationId}
              pendingMessage={pendingMessage}
              requestStartedAt={requestStartedAt}
              onLiveTerminal={handleLiveTerminal}
            />
            <InputBar
              workspaceId={workspaceId ?? ""}
              disabled={!chatId}
              busy={!!liveInvestigationId}
              onSend={handleSend}
              onStop={handleStop}
            />
          </>
        ) : workspaceId ? (
          <ChatLanding
            chats={chats}
            submitting={startingChat}
            onStartChat={handleStartChat}
            onSelectChat={selectChat}
            onNewChat={handleNewChat}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
              <span className="h-3 w-3 rounded-full bg-accent" />
            </div>
            <p className="max-w-xs text-sm text-muted">
              Create a workspace to get started.
            </p>
          </div>
        )}
      </main>

      {workspaceId && (
        <DashboardPanel
          workspaceId={workspaceId}
          section={rightSection}
          onSectionChange={setRightSection}
        />
      )}
    </div>
  );
}
