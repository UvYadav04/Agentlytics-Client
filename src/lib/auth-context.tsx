// Deprecated - replaced by RTK Query. Auth state now comes from
// `useGetMeQuery()` (src/lib/api/apiSlice.ts) called directly wherever a
// component needs the current user, instead of a React context. Login/
// logout are `useGoogleLoginMutation()`/`useLogoutMutation()`, which
// invalidate the "User" tag so every `useGetMeQuery()` subscriber refetches
// automatically.
//
// Nothing in the app imports this file anymore. Safe to delete
// (Client/src/lib/auth-context.tsx) - left in place only because this
// environment has no file-delete tool available.
export {};
