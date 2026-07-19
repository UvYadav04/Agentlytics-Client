"use client";

import Link from "next/link";
import { useGetMeQuery, useLogoutMutation } from "@/lib/api/apiSlice";
import GoogleLoginButton from "./GoogleLoginButton";

export default function Navbar() {
  const { data: user, isLoading, isFetching } = useGetMeQuery();
  const [logout] = useLogoutMutation();

  const loading = isLoading || isFetching;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 rounded-md bg-accent" />
          <span className="font-semibold tracking-tight">Agentlytics</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/architecture"
            className="text-sm text-text hover:text-accent-dark transition-colors"
          >
            Architecture
          </Link>
          {user && (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm text-text hover:text-accent-dark transition-colors"
              >
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
                Profile
              </Link>
              <button
                onClick={() => logout()}
                className="text-sm text-muted hover:text-text transition-colors"
              >
                Sign out
              </button>
            </>
          )}
          {!user && !loading && (
            <GoogleLoginButton
              label="Log in"
              className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent-dark"
            />
          )}
        </nav>
      </div>
    </header>
  );
}
