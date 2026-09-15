"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/lib/api/apiSlice";

export function useRequireAuth(redirectTo = "/login"): boolean {
  const router = useRouter();
  const { data: user, isLoading, isFetching } = useGetMeQuery();

  useEffect(() => {
    if (!isLoading && !isFetching && !user) router.replace(redirectTo);
  }, [user, isLoading, isFetching, router, redirectTo]);

  return isLoading || isFetching || !!user;
}
