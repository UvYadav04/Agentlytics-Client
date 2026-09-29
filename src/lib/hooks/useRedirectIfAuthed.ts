"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/lib/api/apiSlice";

export function useRedirectIfAuthed(redirectTo = "/chat"): boolean {
  const router = useRouter();
  const { data: user, isLoading, isFetching } = useGetMeQuery();

  useEffect(() => {
    if (user) router.replace(redirectTo);
  }, [user, router, redirectTo]);

  return isLoading || isFetching || !!user;
}
