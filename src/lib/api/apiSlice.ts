import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/config";
import type {
  Chat,
  ChatMessage,
  ChartDetail,
  DashboardDetail,
  DashboardShare,
  DashboardSummary,
  DashboardTheme,
  LiveDashboardData,
  SharedDashboard,
  TimeWindowUnit,
  DatabaseConnection,
  DatabaseConnectionDetail,
  DatabaseTestResult,
  DatabaseType,
  FileItem,
  FileStatus,
  RememberOption,
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

export type ReportSummary = {
  id: string;
  message_id: string;
  title: string;
  format: string;
  url: string | null;
  created_at: string;
};


export type SendMessageResult = {
  message_id: string | null;
  investigation_id: string | null;
  limited: boolean;
  limit_message: string | null;
  answered_question: boolean;
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
    "Database",
    "DashboardShare",
  ],
  endpoints: (builder) => ({
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
    getWorkspaceReports: builder.query<ReportSummary[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/reports`,
      providesTags: (result, error, workspaceId) => [
        { type: "Report" as const, id: `WORKSPACE-${workspaceId}` },
      ],
    }),

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
      { workspaceId: string; filename: string; contentType: string; sizeBytes: number; batchId?: string }
    >({
      query: ({ workspaceId, filename, contentType, sizeBytes, batchId }) => ({
        url: `/workspaces/${workspaceId}/files/presign`,
        method: "POST",
        body: { filename, content_type: contentType, size_bytes: sizeBytes, batch_id: batchId },
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
    failUpload: builder.mutation<FileItem, { fileId: string; workspaceId: string; error?: string }>({
      query: ({ fileId, error }) => ({ url: `/files/${fileId}/fail`, method: "POST", body: { error } }),
      invalidatesTags: (result, error, arg) => [
        { type: "File", id: arg.fileId },
        { type: "File", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    renameFile: builder.mutation<FileItem, { fileId: string; workspaceId: string; filename: string }>({
      query: ({ fileId, filename }) => ({ url: `/files/${fileId}`, method: "PATCH", body: { filename } }),
      invalidatesTags: (result, error, arg) => [
        { type: "File", id: arg.fileId },
        { type: "File", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    replaceFilePresign: builder.mutation<
      PresignResult,
      { fileId: string; workspaceId: string; filename: string; contentType: string; sizeBytes: number }
    >({
      query: ({ fileId, filename, contentType, sizeBytes }) => ({
        url: `/files/${fileId}/replace/presign`,
        method: "POST",
        body: { filename, content_type: contentType, size_bytes: sizeBytes },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "File", id: `LIST-${arg.workspaceId}` }],
    }),
    replaceFileConfirm: builder.mutation<FileItem, { fileId: string; workspaceId: string }>({
      query: ({ fileId }) => ({ url: `/files/${fileId}/replace/confirm`, method: "POST" }),
      invalidatesTags: (result, error, arg) => [
        { type: "File", id: arg.fileId },
        { type: "File", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    replaceFileCancel: builder.mutation<FileItem, { fileId: string; workspaceId: string }>({
      query: ({ fileId }) => ({ url: `/files/${fileId}/replace/cancel`, method: "POST" }),
      invalidatesTags: (result, error, arg) => [
        { type: "File", id: arg.fileId },
        { type: "File", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    retryFile: builder.mutation<FileItem, { fileId: string; workspaceId: string }>({
      query: ({ fileId }) => ({ url: `/files/${fileId}/retry`, method: "POST" }),
      invalidatesTags: (result, error, arg) => [
        { type: "File", id: arg.fileId },
        { type: "File", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    getFileDownloadUrl: builder.mutation<{ url: string }, string>({
      query: (fileId) => ({ url: `/files/${fileId}/download`, method: "GET" }),
    }),
    deleteFile: builder.mutation<{ ok: boolean }, { fileId: string; workspaceId: string }>({
      query: ({ fileId }) => ({ url: `/files/${fileId}`, method: "DELETE" }),
      invalidatesTags: (result, error, arg) => [
        { type: "File", id: arg.fileId },
        { type: "File", id: `LIST-${arg.workspaceId}` },
      ],
    }),

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
      invalidatesTags: (result, error, arg) => [
        { type: "Chat", id: arg.chatId },
        { type: "Chat", id: `LIST-${arg.workspaceId}` },
        { type: "Message", id: `LIST-${arg.chatId}` },
        { type: "Chart", id: `WORKSPACE-${arg.workspaceId}` },
        { type: "Report", id: `WORKSPACE-${arg.workspaceId}` },
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
      { chatId: string; content: string; fileIds?: string[]; answerTo?: string }
    >({
      query: ({ chatId, content, fileIds, answerTo }) => ({
        url: `/chats/${chatId}/messages`,
        method: "POST",
        body: { content, file_ids: fileIds ?? [], answer_to: answerTo ?? null },
      }),
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
    getDashboardData: builder.query<LiveDashboardData, string>({
      query: (id) => `/dashboards/${id}/data`,
      keepUnusedDataFor: 0,
    }),
    updateDashboard: builder.mutation<
      DashboardSummary,
      {
        dashboardId: string;
        workspaceId: string;
        name?: string;
        theme?: Partial<Pick<DashboardTheme, "mode" | "show_legend" | "show_grid">>;
        timeWindow?: { last: number; unit: TimeWindowUnit };
      }
    >({
      query: ({ dashboardId, name, theme, timeWindow }) => ({
        url: `/dashboards/${dashboardId}`,
        method: "PATCH",
        body: { name: name ?? null, theme: theme ?? null, time_window: timeWindow ?? null },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Dashboard", id: arg.dashboardId },
        { type: "Dashboard", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    getDashboardShares: builder.query<DashboardShare[], string>({
      query: (dashboardId) => `/dashboards/${dashboardId}/shares`,
      providesTags: (result, error, dashboardId) => [{ type: "DashboardShare", id: dashboardId }],
    }),
    createDashboardShare: builder.mutation<
      DashboardShare,
      { dashboardId: string; emails: string[]; validDays: number }
    >({
      query: ({ dashboardId, emails, validDays }) => ({
        url: `/dashboards/${dashboardId}/shares`,
        method: "POST",
        body: { emails, valid_days: validDays },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "DashboardShare", id: arg.dashboardId }],
    }),
    revokeDashboardShare: builder.mutation<{ ok: boolean }, { shareId: string; dashboardId: string }>({
      query: ({ shareId }) => ({ url: `/dashboard-shares/${shareId}`, method: "DELETE" }),
      invalidatesTags: (result, error, arg) => [{ type: "DashboardShare", id: arg.dashboardId }],
    }),
    getSharedDashboard: builder.query<SharedDashboard, string>({
      query: (shareId) => `/shared-dashboards/${shareId}`,
    }),
    getSharedDashboardData: builder.query<LiveDashboardData, string>({
      query: (shareId) => `/shared-dashboards/${shareId}/data`,
      keepUnusedDataFor: 0,
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

    getUsage: builder.query<UsageInfo, void>({
      query: () => "/usage",
      providesTags: ["Usage"],
    }),

    submitFeedback: builder.mutation<{ ok: boolean }, string>({
      query: (message) => ({ url: "/feedback", method: "POST", body: { message } }),
    }),

    getDatabases: builder.query<DatabaseConnection[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/databases`,
      providesTags: (result, error, workspaceId) =>
        result
          ? [
              ...result.map((d) => ({ type: "Database" as const, id: d.id })),
              { type: "Database" as const, id: `LIST-${workspaceId}` },
            ]
          : [{ type: "Database" as const, id: `LIST-${workspaceId}` }],
    }),
    getDatabase: builder.query<DatabaseConnectionDetail, string>({
      query: (connectionId) => `/databases/${connectionId}`,
      providesTags: (result, error, connectionId) => [{ type: "Database", id: connectionId }],
    }),
    testDatabaseConnection: builder.mutation<
      DatabaseTestResult,
      { workspaceId: string; dbType: DatabaseType; connectionString: string }
    >({
      query: ({ workspaceId, dbType, connectionString }) => ({
        url: `/workspaces/${workspaceId}/databases/test`,
        method: "POST",
        body: { db_type: dbType, connection_string: connectionString },
      }),
    }),
    createDatabaseConnection: builder.mutation<
      DatabaseConnectionDetail,
      {
        workspaceId: string;
        dbType: DatabaseType;
        connectionString: string;
        name?: string;
        remember: RememberOption;
      }
    >({
      query: ({ workspaceId, dbType, connectionString, name, remember }) => ({
        url: `/workspaces/${workspaceId}/databases`,
        method: "POST",
        body: { db_type: dbType, connection_string: connectionString, name: name || null, remember },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Database", id: `LIST-${arg.workspaceId}` }],
    }),
    reconnectDatabase: builder.mutation<
      DatabaseConnectionDetail,
      { connectionId: string; workspaceId: string; connectionString: string; remember?: RememberOption }
    >({
      query: ({ connectionId, connectionString, remember }) => ({
        url: `/databases/${connectionId}/reconnect`,
        method: "POST",
        body: { connection_string: connectionString, remember: remember ?? null },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Database", id: arg.connectionId },
        { type: "Database", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    refreshDatabaseSchema: builder.mutation<
      DatabaseConnectionDetail,
      { connectionId: string; workspaceId: string }
    >({
      query: ({ connectionId }) => ({ url: `/databases/${connectionId}/refresh`, method: "POST" }),
      invalidatesTags: (result, error, arg) => [
        { type: "Database", id: arg.connectionId },
        { type: "Database", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    updateDatabaseConnection: builder.mutation<
      DatabaseConnection,
      { connectionId: string; workspaceId: string; name?: string; remember?: RememberOption }
    >({
      query: ({ connectionId, name, remember }) => ({
        url: `/databases/${connectionId}`,
        method: "PATCH",
        body: { name: name ?? null, remember: remember ?? null },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Database", id: arg.connectionId },
        { type: "Database", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    deleteDatabaseConnection: builder.mutation<
      { ok: boolean },
      { connectionId: string; workspaceId: string }
    >({
      query: ({ connectionId }) => ({ url: `/databases/${connectionId}`, method: "DELETE" }),
      invalidatesTags: (result, error, arg) => [{ type: "Database", id: `LIST-${arg.workspaceId}` }],
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
  useGetWorkspaceReportsQuery,
  useGetFilesQuery,
  usePresignUploadMutation,
  useConfirmUploadMutation,
  useCancelUploadMutation,
  useFailUploadMutation,
  useDeleteFileMutation,
  useRenameFileMutation,
  useReplaceFilePresignMutation,
  useReplaceFileConfirmMutation,
  useReplaceFileCancelMutation,
  useRetryFileMutation,
  useGetFileDownloadUrlMutation,
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
  useGetDashboardDataQuery,
  useUpdateDashboardMutation,
  useGetDashboardSharesQuery,
  useCreateDashboardShareMutation,
  useRevokeDashboardShareMutation,
  useGetSharedDashboardQuery,
  useGetSharedDashboardDataQuery,
  useGetDashboardsQuery,
  useCreateDashboardMutation,
  useRefreshDashboardMutation,
  useRelinkDashboardFileMutation,
  useGetUsageQuery,
  useSubmitFeedbackMutation,
  useGetDatabasesQuery,
  useGetDatabaseQuery,
  useTestDatabaseConnectionMutation,
  useCreateDatabaseConnectionMutation,
  useReconnectDatabaseMutation,
  useRefreshDatabaseSchemaMutation,
  useUpdateDatabaseConnectionMutation,
  useDeleteDatabaseConnectionMutation,
} = api;

export type { FileStatus };
