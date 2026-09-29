"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  api,
  useCancelInvestigationMutation,
  useCreateChatMutation,
  useGetChatsQuery,
  useGetMeQuery,
  useGetMessagesQuery,
  useGetWorkspacesQuery,
  useSendMessageMutation,
} from "@/lib/api/apiSlice";
import { useAppDispatch } from "@/lib/hooks";
import type { ChatMessage, DatabaseConnection, PendingQuestion, Workspace } from "@/lib/types";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import WorkspaceSwitcher from "@/components/chat/WorkspaceSwitcher";
import FilesPanel from "@/components/chat/FilesPanel";
import DatabasesPanel from "@/components/chat/DatabasesPanel";
import ConnectDatabaseModal from "@/components/database/ConnectDatabaseModal";
import ChatsPanel from "@/components/chat/ChatsPanel";
import MessageList from "@/components/chat/MessageList";
import InputBar from "@/components/chat/InputBar";
import ChatLanding from "@/components/chat/ChatLanding";
import EmptyChatComposer from "@/components/chat/EmptyChatComposer";
import DashboardPanel, { type RightSection } from "@/components/chat/DashboardPanel";

function extractErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { data?: unknown } | undefined)?.data as { detail?: string } | undefined;
  return typeof data?.detail === "string" ? data.detail : fallback;
}

const EMPTY_WORKSPACES: Workspace[] = [];

export default function ChatPage() {
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
  const { data: workspaces = EMPTY_WORKSPACES } = useGetWorkspacesQuery(undefined, { skip: !user });

  const [workspaceId, setWorkspaceId] = useState<string | null>(searchParams.get("workspace"));
  const [chatId, setChatId] = useState<string | null>(searchParams.get("chat"));
  const [liveInvestigationId, setLiveInvestigationId] = useState<string | null>(null);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [startingChat, setStartingChat] = useState(false);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const hydratedChatRef = useRef<string | null>(null);
  const [sending, setSending] = useState(false);
  const [requestStartedAt, setRequestStartedAt] = useState<number | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<PendingQuestion | null>(null);

  const [leftSection, setLeftSection] = useState<"databases" | "files" | "chats" | null>("chats");
  const [connectDatabase, setConnectDatabase] = useState<{ reconnectTarget: DatabaseConnection | null } | null>(
    () => (searchParams.get("connect") === "database" ? { reconnectTarget: null } : null)
  );
  const [rightSection, setRightSection] = useState<RightSection>(null);

  const dispatch = useAppDispatch();
  const [sendMessage] = useSendMessageMutation();
  const [cancelInvestigation] = useCancelInvestigationMutation();
  const [createChat] = useCreateChatMutation();

  useEffect(() => {
    if (!workspaceId && workspaces.length > 0) setWorkspaceId(workspaces[0].id);
  }, [workspaces, workspaceId]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (workspaceId) params.set("workspace", workspaceId);
    if (chatId) params.set("chat", chatId);
    const qs = params.toString();
    if (qs === searchParams.toString()) return;
    router.replace(qs ? `/chat?${qs}` : "/chat", { scroll: false });
  }, [workspaceId, chatId, router, searchParams]);


  const { data: chats = [] } = useGetChatsQuery(workspaceId ?? "", { skip: !workspaceId });
  const activeChatTitle = chats.find((c) => c.id === chatId)?.title;

  const { data: chatMessages = [], isLoading: messagesLoading } = useGetMessagesQuery(
    chatId ?? "",
    { skip: !chatId }
  );

  useEffect(() => {
    if (!chatId) {
      setCurrentMessages([]);
      hydratedChatRef.current = null;
      return;
    }
    if (messagesLoading) return;
    if (hydratedChatRef.current === chatId) return;
    setCurrentMessages(chatMessages);
    hydratedChatRef.current = chatId;
  }, [chatId, chatMessages, messagesLoading]);

  const visibleMessages = currentMessages.filter((m) => m.chat_id === chatId);

  const showEmptyComposer =
    !!chatId && !messagesLoading && visibleMessages.length === 0 && !liveInvestigationId && !sending;

  function selectWorkspace(id: string) {
    setWorkspaceId(id);
    setChatId(null);
    setLiveInvestigationId(null);
    setPendingQuestion(null);
    setRequestStartedAt(null);
    setSending(false);
  }

  function selectChat(id: string | null) {
    setChatId(id);
    setCurrentMessages([]);
    setLiveInvestigationId(null);
    setPendingQuestion(null);
    setLimitMessage(null);
    setRequestStartedAt(null);
    setSending(false);
  }

  async function handleAnswer(answer: string, questionId: string) {
    if (!chatId) return;
    setLimitMessage(null);
    setSending(true);
    try {
      const res = await sendMessage({ chatId, content: answer, answerTo: questionId }).unwrap();
      if (res.answered_question) setPendingQuestion(null);
    } catch (err) {
      setLimitMessage(extractErrorMessage(err, "Couldn't send your answer. Please try again."));
      throw err;
    } finally {
      setSending(false);
    }
  }

  async function handleSend(content: string, fileIds: string[]) {
    if (!chatId) return;
    if (pendingQuestion && liveInvestigationId) {
      await handleAnswer(content, pendingQuestion.question_id).catch(() => undefined);
      return;
    }
    setLimitMessage(null);
    setSending(true);
    setRequestStartedAt(Date.now());
    const tempId = `pending-${Date.now()}`;
    setCurrentMessages((prev) => [
      ...prev,
      {
        id: tempId,
        chat_id: chatId,
        role: "user",
        content,
        investigation_id: null,
        chart_ids: [],
        report_id: null,
        csv_file_ids: [],
        files_used: fileIds,
        follow_up_questions: [],
        created_at: new Date().toISOString(),
      },
    ]);
    try {
      const res = await sendMessage({ chatId, content, fileIds }).unwrap();
      if (res.answered_question) {
        setCurrentMessages((prev) => prev.filter((m) => m.id !== tempId));
        setLiveInvestigationId(res.investigation_id);
        return;
      }
      const messageId = res.message_id ?? tempId;
      setCurrentMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, id: messageId, investigation_id: res.investigation_id } : m
        )
      );
      if (res.limited) {
        setLimitMessage(res.limit_message);
        setRequestStartedAt(null);
      } else {
        setLiveInvestigationId(res.investigation_id);
      }
    } catch (err) {
      setCurrentMessages((prev) => prev.filter((m) => m.id !== tempId));
      setRequestStartedAt(null);
      throw err;
    } finally {
      setSending(false);
    }
  }

  async function handleStop() {
    if (!liveInvestigationId) return;
    await cancelInvestigation(liveInvestigationId);
  }

  async function handleStartChat(content: string) {
    if (!workspaceId || startingChat) return;
    setStartingChat(true);
    setSending(true);
    setRequestStartedAt(Date.now());
    setLimitMessage(null);
    const tempId = `pending-${Date.now()}`;
    let chatCreated = false;
    try {
      const chat = await createChat({ workspaceId }).unwrap();
      chatCreated = true;
      setChatId(chat.id);
      hydratedChatRef.current = chat.id;
      setCurrentMessages([
        {
          id: tempId,
          chat_id: chat.id,
          role: "user",
          content,
          investigation_id: null,
          chart_ids: [],
          report_id: null,
          csv_file_ids: [],
          files_used: [],
          follow_up_questions: [],
          created_at: new Date().toISOString(),
        },
      ]);
      const res = await sendMessage({ chatId: chat.id, content }).unwrap();
      const messageId = res.message_id ?? tempId;
      setCurrentMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, id: messageId, investigation_id: res.investigation_id } : m
        )
      );
      if (res.limited) {
        setLimitMessage(res.limit_message);
        setRequestStartedAt(null);
      } else {
        setLiveInvestigationId(res.investigation_id);
      }
    } catch (err) {
      if (chatCreated) {
        setCurrentMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
      setRequestStartedAt(null);
      setLimitMessage(
        extractErrorMessage(err, "Couldn't start this chat. Please try again.")
      );
    } finally {
      setStartingChat(false);
      setSending(false);
    }
  }

  async function handleNewChat() {
    if (!workspaceId) return;
    try {
      const chat = await createChat({ workspaceId }).unwrap();
      selectChat(chat.id);
    } catch (err) {
      setLimitMessage(extractErrorMessage(err, "Couldn't start a new chat. Please try again."));
    }
  }

  function handleLiveTerminal() {
    const finishedChatId = chatId;
    setRequestStartedAt(null);
    setPendingQuestion(null);
    if (!finishedChatId || !workspaceId) {
      setLiveInvestigationId(null);
      return;
    }
    dispatch(api.endpoints.getMessages.initiate(finishedChatId, { forceRefetch: true }))
      .then((result) => {
        const fresh = result.data ?? [];
        setCurrentMessages((prev) => {
          const known = new Set(prev.map((m) => m.id));
          const additions = fresh.filter((m) => !known.has(m.id));
          return additions.length ? [...prev, ...additions] : prev;
        });
      })
      .finally(() => setLiveInvestigationId(null));

    dispatch(
      api.util.invalidateTags([
        { type: "Chart", id: `WORKSPACE-${workspaceId}` },
        { type: "Report", id: `WORKSPACE-${workspaceId}` },
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
          <DatabasesPanel
            workspaceId={workspaceId}
            open={leftSection === "databases"}
            onToggle={() => setLeftSection((s) => (s === "databases" ? null : "databases"))}
            onConnect={(reconnectTarget) => setConnectDatabase({ reconnectTarget: reconnectTarget ?? null })}
          />
        )}
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

        {limitMessage && (
          <div className="border-b border-border bg-gold/15 px-4 py-2 text-center text-sm text-accent-dark">
            {limitMessage}
          </div>
        )}

        {chatId && messagesLoading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            <span className="ml-2">Loading...</span>
          </div>
        ) : chatId && showEmptyComposer ? (
          <EmptyChatComposer
            submitting={sending}
            onSubmit={(content) => handleSend(content, [])}
          />
        ) : chatId ? (
          <>
            <MessageList
              chatId={chatId}
              workspaceId={workspaceId}
              messages={visibleMessages}
              liveInvestigationId={liveInvestigationId}
              sending={sending}
              requestStartedAt={requestStartedAt}
              onLiveTerminal={handleLiveTerminal}
              onSend={handleSend}
              onAnswer={handleAnswer}
              onPendingQuestionChange={setPendingQuestion}
            />
            <InputBar
              workspaceId={workspaceId ?? ""}
              disabled={!chatId}
              busy={!!liveInvestigationId}
              answering={!!pendingQuestion && !!liveInvestigationId && !sending}
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
            onConnectDatabase={() => setConnectDatabase({ reconnectTarget: null })}
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

      {workspaceId && connectDatabase && (
        <ConnectDatabaseModal
          workspaceId={workspaceId}
          reconnectTarget={connectDatabase.reconnectTarget}
          onClose={() => setConnectDatabase(null)}
          onConnected={() => setLeftSection("databases")}
        />
      )}

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
