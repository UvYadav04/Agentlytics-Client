"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGetMeQuery } from "@/lib/api/apiSlice";

const HIDDEN_ON = ["/login", "/signup", "/forgot-password"];

export default function Navbar() {
  const pathname = usePathname();
  const { data: user, isLoading, isFetching } = useGetMeQuery();

  const loading = isLoading || isFetching;

  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 rounded-md bg-accent" />
          <span className="font-semibold tracking-tight">Agentlytics</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="hidden text-sm font-medium text-muted transition-colors hover:text-accent-dark sm:inline"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="hidden text-sm font-medium text-muted transition-colors hover:text-accent-dark sm:inline"
          >
            About
          </Link>

          {user && (
            <Link
              href="/chat"
              className="hidden rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white shadow-card transition-colors hover:bg-accent-dark sm:inline-block"
            >
              My Workspace
            </Link>
          )}

          {user && (
            <Link href="/profile" title="Profile" className="shrink-0 transition-transform hover:scale-105">
              {user.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-border"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-dark">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
              )}
            </Link>
          )}
          {!user && !loading && (
            <Link
              href="/login"
              className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent-dark"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
