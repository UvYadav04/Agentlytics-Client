// Deprecated - replaced by RTK Query (src/lib/api/apiSlice.ts). All
// components now call the generated hooks (useGetWorkspacesQuery,
// useSendMessageMutation, etc.) directly instead of this manual fetch
// wrapper. The SSE URL helper moved to src/lib/sse.ts (SSE is a push
// channel, not request/response, so it isn't part of the RTK Query slice).
//
// Nothing in the app imports this file anymore. Safe to delete
// (Client/src/lib/api.ts) - left in place only because this environment has
// no file-delete tool available.
export {};
