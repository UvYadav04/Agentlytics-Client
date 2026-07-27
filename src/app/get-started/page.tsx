"use client";

import Link from "next/link";
import {
  Brain,
  CheckCircle2,
  Download,
  FileText,
  LayoutDashboard,
  Layers,
  Share2,
  Sparkles,
} from "lucide-react";
import { useGetMeQuery } from "@/lib/api/apiSlice";
import Reveal from "@/components/Reveal";

// Reachable from the hero/final CTA on the homepage ("Get started") but
// deliberately left out of the navbar - this sells what you can *build*
// with Agentlytics (reports, dashboards, memory) rather than repeating the
// homepage's "how agents investigate" pitch.

const CAPABILITIES = [
  {
    title: "Written reports on demand",
    body: "Ask for a summary and get a polished, shareable report - charts, findings, and citations included - not a wall of chat text.",
    color: "bg-accent",
    icon: FileText,
  },
  {
    title: "Cross-file reasoning",
    body: "Ask a question that spans five files and get one answer, not five separate ones you have to reconcile yourself.",
    color: "bg-plum",
    icon: Layers,
  },
  {
    title: "Workspace memory",
    body: "Agents remember what you've already asked in a workspace, so follow-up questions don't need to repeat context.",
    color: "bg-clay",
    icon: Brain,
  },
  {
    title: "Share a link, not a screenshot",
    body: "Charts, dashboards, and reports each get a link you can hand to a teammate who never has to touch the raw files.",
    color: "bg-gold",
    icon: Share2,
  },
  {
    title: "Export anywhere",
    body: "Pull a chart into a deck or drop a report straight into your docs - your findings aren't stuck inside a chat window.",
    color: "bg-rust",
    icon: Download,
  },
  {
    title: "Live dashboards",
    body: "Pin a set of charts and watch them refresh as the underlying files change - no re-asking the same question every week.",
    color: "bg-accent-dark",
    icon: LayoutDashboard,
    soon: true,
  },
];

function MiniBarChart({ className = "" }: { className?: string }) {
  const data = [35, 62, 48, 90, 73, 55, 88];
  const max = Math.max(...data);
  return (
    <div className={`flex h-16 items-end gap-1 ${className}`}>
      {data.map((v, i) => (
        <span
          key={i}
          className="flex-1 rounded-t-sm bg-gradient-to-t from-accent to-gold"
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

// Bottom of the page: the one decision a first-time visitor needs to make.
function FinalCTA() {
  const { data: user, isLoading: loading } = useGetMeQuery();

  return (
    <div className="mt-8 flex justify-center">
      {loading ? null : user ? (
        <Link
          href="/chat"
          className="rounded-full bg-accent px-6 py-3 text-white font-medium shadow-card transition-all hover:bg-accent-dark hover:shadow-[0_0_40px_-8px_rgba(204,120,92,0.6)]"
        >
          My Workspace
        </Link>
      ) : (
        <Link
          href="/login"
          className="rounded-full bg-accent px-6 py-3 text-white font-medium shadow-card transition-all hover:bg-accent-dark hover:shadow-[0_0_40px_-8px_rgba(204,120,92,0.6)]"
        >
          Login to start analyzing
        </Link>
      )}
    </div>
  );
}

export default function GetStartedPage() {
  return (
    <main>
      {/* 1. Intro */}
      <section className="relative overflow-hidden px-6 py-16 sm:py-20 text-center">
        <div className="glow-blob animate-float-a -top-20 -left-20 h-80 w-80 bg-accent opacity-25" />
        <div className="glow-blob animate-float-b top-10 -right-16 h-72 w-72 bg-gold opacity-20" />
        <Reveal className="relative mx-auto max-w-2xl">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted shadow-card">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Getting started with Agentlytics
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            More than answers - reports, dashboards, and a memory of your data
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted text-sm sm:text-base">
            A workspace is more than a chat box. Here's what you can build
            once your files are in it.
          </p>
        </Reveal>
      </section>

      {/* 2. Capabilities */}
      <section className="border-t border-border bg-card/60">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <Reveal className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              What you can build
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Every question feeds into something that outlasts the chat it
              came from.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 text-left">
            {CAPABILITIES.map((card, i) => (
              <Reveal key={card.title} delay={(i % 3) * 100}>
                <div className="relative h-full overflow-hidden rounded-card border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:border-accent/25 hover:shadow-[0_0_40px_-10px_rgba(204,120,92,0.4)]">
                  <span className={`absolute inset-x-0 top-0 h-1 ${card.color}`} />
                  {card.soon && (
                    <span className="absolute right-3 top-3 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-dark">
                      Coming soon
                    </span>
                  )}
                  <div className="p-6">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-card ${card.color}`}
                    >
                      <card.icon className="h-4 w-4 animate-icon-breathe text-white" />
                    </span>
                    <h3 className="mt-4 font-semibold">{card.title}</h3>
                    <p className="mt-2 text-sm text-muted leading-relaxed">
                      {card.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Report generation, up close */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                Reports
              </span>
              <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
                From a question to a document you can send
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                Ask for a summary of a quarter, a contract, or a stack of
                invoices, and instead of another chat bubble you get a
                structured report: a written summary, the supporting chart,
                and a citation for every number in it. Saved to your
                workspace, ready to export or share.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {[
                  "Findings written in plain language, not query output",
                  "Every claim links back to its source file and row",
                  "Export as a link, a PDF, or drop it into a deck",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-text">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={120}>
              <div className="overflow-hidden rounded-card border border-border bg-card shadow-[0_20px_60px_-25px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                  <FileText className="h-4 w-4 text-accent-dark" />
                  <span className="text-xs font-medium text-muted">
                    Q3-regional-performance.report
                  </span>
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <div className="h-3 w-2/3 rounded bg-border" />
                    <div className="mt-2 h-2.5 w-full rounded bg-border/70" />
                    <div className="mt-1.5 h-2.5 w-5/6 rounded bg-border/70" />
                  </div>
                  <MiniBarChart />
                  <div className="space-y-1.5">
                    {["West region missed target by 26%", "East and Central beat target"].map(
                      (line) => (
                        <div key={line} className="flex items-center gap-2 text-xs text-muted">
                          <span className="h-1.5 w-1.5 rounded-full bg-clay" />
                          {line}
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted">
                    <span>Generated in 41s</span>
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 font-medium text-accent-dark">
                      3 sources cited
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4. Live dashboards teaser */}
      <section className="relative overflow-hidden border-t border-border bg-card/60">
        <div className="glow-blob animate-float-c -top-10 -right-16 h-72 w-72 bg-plum opacity-20" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal className="lg:order-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-plum px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                Coming soon
              </span>
              <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
                Dashboards that stay live
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                Pin the charts you care about and Agentlytics keeps them
                current as your source files change - no re-asking the same
                question every Monday morning. One link, always up to date.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {[
                  "Auto-refreshes when a linked file is updated",
                  "Mix charts from different files on one board",
                  "Share a single link with your whole team",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-text">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-plum" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={120}>
              <div className="relative overflow-hidden rounded-card border border-border bg-card p-5 shadow-card">
                <span className="absolute right-4 top-4 z-10 rounded-full bg-plum px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-card">
                  Preview
                </span>
                <div className="grid grid-cols-2 gap-3 opacity-50 blur-[1px]">
                  <div className="rounded-lg border border-border bg-bg p-3">
                    <MiniBarChart className="h-12" />
                  </div>
                  <div className="rounded-lg border border-border bg-bg p-3">
                    <div className="h-12 w-full rounded bg-gradient-to-tr from-plum/30 to-transparent" />
                  </div>
                  <div className="rounded-lg border border-border bg-bg p-3">
                    <div className="h-3 w-1/2 rounded bg-border" />
                    <div className="mt-3 h-8 w-full rounded bg-border/70" />
                  </div>
                  <div className="rounded-lg border border-border bg-bg p-3">
                    <MiniBarChart className="h-12" />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="relative overflow-hidden border-t border-border">
        <div className="glow-blob animate-float-b top-0 right-1/4 h-80 w-80 bg-accent opacity-30" />
        <div className="relative mx-auto max-w-4xl px-6 py-16 sm:py-24 text-center">
          <Reveal>
            <span className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted shadow-card">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Ready when you are
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Stop taking the model's word for it.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Create a workspace, upload your first file, and ask your first
              question - free to start.
            </p>
            <FinalCTA />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
