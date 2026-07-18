"use client";

import Link from "next/link";
import { useGetMeQuery, useLogoutMutation } from "@/lib/api/apiSlice";
import GoogleLoginButton from "./GoogleLoginButton";
import UsageIndicator from "./UsageIndicator";

export default function Navbar() {
  const { data: user, isLoading, isFetching } = useGetMeQuery();
  const [logout] = useLogoutMutation();

  const loading = isLoading || isFetching;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 rounded-md bg-accent" />
          <span className="font-semibold tracking-tight">Data Analyzer</span>
        </Link>

        <nav className="flex items-center gap-4">
          {user && (
            <>
              <UsageIndicator />
              <Link
                href="/chat"
                className="text-sm text-text hover:text-accent-dark transition-colors"
              >
                Workspace
              </Link>
              <Link
                href="/profile"
                className="text-sm text-text hover:text-accent-dark transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/feedback"
                className="text-sm text-text hover:text-accent-dark transition-colors"
              >
                Feedback
              </Link>
              {user.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-7 w-7 rounded-full border border-border"
                />
              ) : (
                <span className="h-7 w-7 rounded-full bg-accent-soft text-accent-dark text-xs flex items-center justify-center font-semibold">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
              )}
              <button
                onClick={() => logout()}
                className="text-sm text-muted hover:text-text transition-colors"
              >
                Sign out
              </button>
            </>
          )}
          {!user && !loading && <GoogleLoginButton />}
        </nav>
      </div>
    </header>
  );
}
