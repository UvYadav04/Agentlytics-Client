import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/config";
import type {
  Chat,
  ChatMessage,
  ChartDetail,
  DashboardDetail,
  FileItem,
  FileStatus,
  ReportDetail,
  UsageInfo,
  User,
  Workspace,
} from "@/lib/types";

export type ChartSummary = {
  id: string;
  message_id: string;
  title: string;
  url: string;
  created_at: string;
};

export type DashboardSummary = {
  id: string;
  workspace_id: string;
  name: string;
  chart_ids: string[];
  created_at: string;
  real_time: boolean;
  file_ids: string[];
  last_refreshed_at: string | null;
};

export type SendMessageResult = {
  message_id: string;
  investigation_id: string | null;
  limited: boolean;
  limit_message: string | null;
};

export type PresignResult = {
  file_id: string;
  upload_url: string;
  storage_key: string;
};

export type MessageResult = { message: string };

export type SignupBody = {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
};

export type LoginBody = { email: string; password: string };

export type ChangePasswordBody = {
  current_password?: string;
  new_password: string;
  confirm_new_password: string;
};

/**
 * Single RTK Query API slice for the whole app. Cache invalidation is
 * modeled with tags scoped per-parent (e.g. `{type: "File", id: "LIST-<workspaceId>"}`)
 * so mutating/creating inside one workspace/chat never invalidates every
 * other workspace/chat's cached lists.
 *
 * SSE (investigation streaming) is NOT modeled here - it's a push channel,
 * not request/response, so it stays as a plain EventSource in
 * useInvestigationStream. Once a stream reaches a terminal event, callers
 * dispatch `api.util.invalidateTags(...)` themselves to pull in whatever
 * the worker produced (new assistant Message, Usage counters, Chart/Report
 * docs) - see app/chat/page.tsx.
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    credentials: "include",
  }),
  tagTypes: [
    "User",
    "Workspace",
    "File",
    "Chat",
    "Message",
    "ActiveInvestigation",
    "Chart",
    "Report",
    "Dashboard",
    "Usage",
  ],
  endpoints: (builder) => ({
    // ---------------------------------------------------------------- auth
    getMe: builder.query<User, void>({
      query: () => "/me",
      providesTags: ["User"],
    }),
    googleLogin: builder.mutation<User, string>({
      query: (idToken) => ({
        url: "/auth/google",
        method: "POST",
        body: { id_token: idToken },
      }),
      invalidatesTags: ["User"],
    }),
    signup: builder.mutation<MessageResult, SignupBody>({
      query: (body) => ({ url: "/auth/signup", method: "POST", body }),
    }),
    login: builder.mutation<User, LoginBody>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    verifyEmail: builder.query<MessageResult, string>({
      query: (token) => `/auth/verify-email?token=${encodeURIComponent(token)}`,
    }),
    resendVerification: builder.mutation<MessageResult, string>({
      query: (email) => ({ url: "/auth/resend-verification", method: "POST", body: { email } }),
    }),
    forgotPassword: builder.mutation<MessageResult, string>({
      query: (email) => ({ url: "/auth/forgot-password", method: "POST", body: { email } }),
    }),
    changePassword: builder.mutation<MessageResult, ChangePasswordBody>({
      query: (body) => ({ url: "/auth/change-password", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation<{ ok: boolean }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["User"],
    }),

    // ----------------------------------------------------------- workspaces
    getWorkspaces: builder.query<Workspace[], void>({
      query: () => "/workspaces",
      providesTags: (result) =>
        result
          ? [
              ...result.map((w) => ({ type: "Workspace" as const, id: w.id })),
              { type: "Workspace" as const, id: "LIST" },
            ]
          : [{ type: "Workspace" as const, id: "LIST" }],
    }),
    createWorkspace: builder.mutation<Workspace, string>({
      query: (name) => ({ url: "/workspaces", method: "POST", body: { name } }),
      invalidatesTags: [{ type: "Workspace", id: "LIST" }],
    }),
    renameWorkspace: builder.mutation<Workspace, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/workspaces/${id}`,
        method: "PATCH",
        body: { name },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Workspace", id: arg.id },
        { type: "Workspace", id: "LIST" },
      ],
    }),
    getWorkspaceCharts: builder.query<ChartSummary[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/charts`,
      providesTags: (result, error, workspaceId) => [
        { type: "Chart" as const, id: `WORKSPACE-${workspaceId}` },
      ],
    }),

    // ---------------------------------------------------------------- files
    getFiles: builder.query<FileItem[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/files`,
      providesTags: (result, error, workspaceId) =>
        result
          ? [
              ...result.map((f) => ({ type: "File" as const, id: f.id })),
              { type: "File" as const, id: `LIST-${workspaceId}` },
            ]
          : [{ type: "File" as const, id: `LIST-${workspaceId}` }],
    }),
    presignUpload: builder.mutation<
      PresignResult,
      { workspaceId: string; filename: string; contentType: string; sizeBytes: number }
    >({
      query: ({ workspaceId, filename, contentType, sizeBytes }) => ({
        url: `/workspaces/${workspaceId}/files/presign`,
        method: "POST",
        body: { filename, content_type: contentType, size_bytes: sizeBytes },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "File", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    confirmUpload: builder.mutation<FileItem, { fileId: string; workspaceId: string }>({
      query: ({ fileId }) => ({ url: `/files/${fileId}/confirm`, method: "POST" }),
      invalidatesTags: (result, error, arg) => [
        { type: "File", id: arg.fileId },
        { type: "File", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    cancelUpload: builder.mutation<FileItem, { fileId: string; workspaceId: string }>({
      query: ({ fileId }) => ({ url: `/files/${fileId}/cancel`, method: "POST" }),
      invalidatesTags: (result, error, arg) => [
        { type: "File", id: arg.fileId },
        { type: "File", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    deleteFile: builder.mutation<{ ok: boolean }, { fileId: string; workspaceId: string }>({
      query: ({ fileId }) => ({ url: `/files/${fileId}`, method: "DELETE" }),
      invalidatesTags: (result, error, arg) => [
        { type: "File", id: arg.fileId },
        { type: "File", id: `LIST-${arg.workspaceId}` },
      ],
    }),

    // ---------------------------------------------------------------- chats
    getChats: builder.query<Chat[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/chats`,
      providesTags: (result, error, workspaceId) =>
        result
          ? [
              ...result.map((c) => ({ type: "Chat" as const, id: c.id })),
              { type: "Chat" as const, id: `LIST-${workspaceId}` },
            ]
          : [{ type: "Chat" as const, id: `LIST-${workspaceId}` }],
    }),
    createChat: builder.mutation<Chat, { workspaceId: string; title?: string }>({
      query: ({ workspaceId, title }) => ({
        url: `/workspaces/${workspaceId}/chats`,
        method: "POST",
        body: { title: title ?? "New chat" },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Chat", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    renameChat: builder.mutation<Chat, { chatId: string; workspaceId: string; title: string }>({
      query: ({ chatId, title }) => ({
        url: `/chats/${chatId}`,
        method: "PATCH",
        body: { title },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Chat", id: arg.chatId },
        { type: "Chat", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    deleteChat: builder.mutation<{ ok: boolean }, { chatId: string; workspaceId: string }>({
      query: ({ chatId }) => ({ url: `/chats/${chatId}`, method: "DELETE" }),
      // Cascades server-side to that chat's messages/charts/reports/files, so
      // sweep every list that could reference them - not just Chat.
      invalidatesTags: (result, error, arg) => [
        { type: "Chat", id: arg.chatId },
        { type: "Chat", id: `LIST-${arg.workspaceId}` },
        { type: "Message", id: `LIST-${arg.chatId}` },
        { type: "Chart", id: `WORKSPACE-${arg.workspaceId}` },
        { type: "Dashboard", id: `LIST-${arg.workspaceId}` },
        { type: "File", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    getMessages: builder.query<ChatMessage[], string>({
      query: (chatId) => `/chats/${chatId}/messages`,
      providesTags: (result, error, chatId) => [
        { type: "Message" as const, id: `LIST-${chatId}` },
      ],
    }),
    sendMessage: builder.mutation<
      SendMessageResult,
      { chatId: string; content: string; fileIds?: string[] }
    >({
      query: ({ chatId, content, fileIds }) => ({
        url: `/chats/${chatId}/messages`,
        method: "POST",
        body: { content, file_ids: fileIds ?? [] },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Message", id: `LIST-${arg.chatId}` },
      ],
    }),
    getActiveInvestigation: builder.query<{ investigation_id: string | null }, string>({
      query: (chatId) => `/chats/${chatId}/active-investigation`,
      providesTags: (result, error, chatId) => [
        { type: "ActiveInvestigation" as const, id: chatId },
      ],
    }),
    cancelInvestigation: builder.mutation<{ ok: boolean }, string>({
      query: (investigationId) => ({
        url: `/investigations/${investigationId}/cancel`,
        method: "POST",
      }),
    }),

    // ------------------------------------------------ charts/reports/dashboards
    getChart: builder.query<ChartDetail, string>({
      query: (id) => `/charts/${id}`,
      providesTags: (result, error, id) => [{ type: "Chart", id }],
    }),
    getReport: builder.query<ReportDetail, string>({
      query: (id) => `/reports/${id}`,
      providesTags: (result, error, id) => [{ type: "Report", id }],
    }),
    getDashboard: builder.query<DashboardDetail, string>({
      query: (id) => `/dashboards/${id}`,
      providesTags: (result, error, id) => [{ type: "Dashboard", id }],
    }),
    getDashboards: builder.query<DashboardSummary[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/dashboards`,
      providesTags: (result, error, workspaceId) =>
        result
          ? [
              ...result.map((d) => ({ type: "Dashboard" as const, id: d.id })),
              { type: "Dashboard" as const, id: `LIST-${workspaceId}` },
            ]
          : [{ type: "Dashboard" as const, id: `LIST-${workspaceId}` }],
    }),
    createDashboard: builder.mutation<
      DashboardSummary,
      { workspaceId: string; name: string; chartIds: string[] }
    >({
      query: ({ workspaceId, name, chartIds }) => ({
        url: `/workspaces/${workspaceId}/dashboards`,
        method: "POST",
        body: { name, chart_ids: chartIds },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Dashboard", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    refreshDashboard: builder.mutation<{ ok: boolean }, { dashboardId: string; workspaceId: string }>({
      query: ({ dashboardId }) => ({ url: `/dashboards/${dashboardId}/refresh`, method: "POST" }),
      // The worker job hasn't necessarily finished by the time this resolves - refresh is
      // fire-and-forget server-side, so this just re-fetches to catch last_refreshed_at
      // ticking over shortly after. Callers that want to reflect "refreshing..." in the UI
      // should track that locally around the mutation call, not from this response.
      invalidatesTags: (result, error, arg) => [
        { type: "Dashboard", id: arg.dashboardId },
        { type: "Dashboard", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    relinkDashboardFile: builder.mutation<
      DashboardSummary,
      { dashboardId: string; workspaceId: string; oldFileId: string; newFileId: string }
    >({
      query: ({ dashboardId, oldFileId, newFileId }) => ({
        url: `/dashboards/${dashboardId}/relink`,
        method: "POST",
        body: { old_file_id: oldFileId, new_file_id: newFileId },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Dashboard", id: arg.dashboardId },
        { type: "Dashboard", id: `LIST-${arg.workspaceId}` },
      ],
    }),

    // --------------------------------------------------------------- usage
    getUsage: builder.query<UsageInfo, void>({
      query: () => "/usage",
      providesTags: ["Usage"],
    }),

    // ------------------------------------------------------------ feedback
    submitFeedback: builder.mutation<{ ok: boolean }, string>({
      query: (message) => ({ url: "/feedback", method: "POST", body: { message } }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useGoogleLoginMutation,
  useSignupMutation,
  useLoginMutation,
  useLazyVerifyEmailQuery,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useChangePasswordMutation,
  useLogoutMutation,
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useRenameWorkspaceMutation,
  useGetWorkspaceChartsQuery,
  useGetFilesQuery,
  usePresignUploadMutation,
  useConfirmUploadMutation,
  useCancelUploadMutation,
  useDeleteFileMutation,
  useGetChatsQuery,
  useCreateChatMutation,
  useRenameChatMutation,
  useDeleteChatMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useGetActiveInvestigationQuery,
  useCancelInvestigationMutation,
  useGetChartQuery,
  useGetReportQuery,
  useGetDashboardQuery,
  useGetDashboardsQuery,
  useCreateDashboardMutation,
  useRefreshDashboardMutation,
  useRelinkDashboardFileMutation,
  useGetUsageQuery,
  useSubmitFeedbackMutation,
} = api;

// Re-exported so callers don't need to know FileStatus lives in types.ts too.
export type { FileStatus };
