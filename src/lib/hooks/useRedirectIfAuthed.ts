"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/lib/api/apiSlice";

// Shared by /login, /signup, /forgot-password - these pages only make sense for a signed-out
// visitor, so bounce anyone who already has a valid session straight to their workspace instead
// of showing them a login form for an account they're already in. Returns true while that check
// is still in flight or a redirect is underway, so the caller can render nothing rather than
// flash the form first.
export function useRedirectIfAuthed(redirectTo = "/chat"): boolean {
  const router = useRouter();
  const { data: user, isLoading, isFetching } = useGetMeQuery();

  useEffect(() => {
    if (user) router.replace(redirectTo);
  }, [user, router, redirectTo]);

  return isLoading || isFetching || !!user;
}
