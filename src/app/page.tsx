"use client";

import Link from "next/link";
import { useGetMeQuery } from "@/lib/api/apiSlice";
import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function HomePage() {
  const { data: user, isLoading: loading } = useGetMeQuery();

  return (
    <main className="mx-auto max-w-5xl px-6 py-24 text-center">
      <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted shadow-card">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        No answer without evidence traced to a real file
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
        Ask questions about your data.
        <br />
        Get answers you can actually trust.
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-muted text-lg">
        Upload CSVs, spreadsheets, and PDFs into a private workspace. A team
        of specialized agents investigates your data and returns answers,
        charts, and reports - every claim traced back to the file it came
        from.
      </p>

      <div className="mt-10 flex items-center justify-center gap-4">
        {loading ? null : user ? (
          <Link
            href="/chat"
            className="rounded-full bg-accent px-6 py-3 text-white font-medium shadow-card hover:bg-accent-dark transition-colors"
          >
            Go to your workspace
          </Link>
        ) : (
          <GoogleLoginButton />
        )}
      </div>

      <div className="mt-20 grid gap-5 sm:grid-cols-3 text-left">
        {[
          {
            title: "Isolated agents",
            body: "A Tabular Agent and a Document Agent investigate independently, in their own context, so noise never pollutes the final answer.",
          },
          {
            title: "Deterministic tools",
            body: "DuckDB queries and RAG retrieval are deterministic - the LLM reasons over real results, never fabricated numbers.",
          },
          {
            title: "Full traceability",
            body: "Every finding carries a reference back to a source file, row, or page - an audit trail attached to every answer.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-card border border-border bg-card p-6 shadow-card"
          >
            <h3 className="font-semibold mb-2">{card.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{card.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
