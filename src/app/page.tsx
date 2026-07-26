"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Calculator,
  Cog,
  Database,
  Layers,
  Link2,
  Lock,
  Rocket,
} from "lucide-react";
import { useGetMeQuery } from "@/lib/api/apiSlice";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import Reveal from "@/components/Reveal";
import SpotlightCursor from "@/components/cursor/SpotlightCursor";

const STEPS = [
  {
    n: "01",
    title: "Upload your files",
    body: "Drop in CSVs, spreadsheets, JSON, or PDFs. Each workspace keeps your files private and isolated from every other workspace.",
    color: "bg-accent",
  },
  {
    n: "02",
    title: "Ask in plain English",
    body: "“Which region underperformed last quarter?” “Summarize the contract's payment terms.” No query language required.",
    color: "bg-gold",
  },
  {
    n: "03",
    title: "Agents investigate",
    body: "Specialized agents run real, deterministic tools against your files, each confined to its own isolated context.",
    color: "bg-plum",
  },
  {
    n: "04",
    title: "Get a traceable answer",
    body: "Every claim links back to the exact file, row, or page it came from - plus charts and reports when useful.",
    color: "bg-clay",
  },
];

const FEATURES = [
  {
    title: "Isolated agents",
    body: "Specialized agents investigate independently, each confined to its own context, so noise from one line of inquiry never pollutes another.",
    color: "bg-accent",
    icon: Layers,
  },
  {
    title: "Deterministic tools",
    body: "Agents don't free-associate numbers - every lookup runs through a deterministic tool, and the model only reasons over real results.",
    color: "bg-clay",
    icon: Cog,
  },
  {
    title: "Full traceability",
    body: "Every finding carries a reference back to a source file, row, or page - an audit trail attached to every answer.",
    color: "bg-plum",
    icon: Link2,
  },
  {
    title: "Charts & reports",
    body: "Ask for a dashboard or a written report and get one generated on the spot, saved to your workspace for later.",
    color: "bg-gold",
    icon: BarChart3,
  },
  {
    title: "Private workspaces",
    body: "Files, chats, and memory are scoped to a workspace you control - nothing leaks across projects or teams.",
    color: "bg-rust",
    icon: Lock,
  },
  {
    title: "Streamed investigations",
    body: "Watch the agents work in real time, with the option to cancel an investigation mid-flight if it's off track.",
    color: "bg-accent-dark",
    icon: Activity,
  },
];

const WITHOUT = [
  "Trusting a chatbot's confident-sounding guess",
  "Manually re-checking every number against the spreadsheet",
  "No record of which file an answer actually came from",
  "One generic prompt for every kind of file",
];

const WITH = [
  "Every claim linked to a row, page, or file",
  "Deterministic tool calls, not guesses",
  "A full investigation trace you can replay",
  "Specialized agents, each in an isolated context",
];

const PERSONAS = [
  {
    title: "Data & ops teams",
    body: "Get straight answers out of messy exports without writing a query.",
    text: "text-accent-dark",
    bar: "bg-accent-dark",
    icon: Database,
  },
  {
    title: "Finance & analysts",
    body: "Cross-check figures and reconcile numbers across files in minutes.",
    text: "text-clay",
    bar: "bg-clay",
    icon: Calculator,
  },
  {
    title: "Researchers",
    body: "Pull findings out of long PDFs with citations back to the exact page.",
    text: "text-plum",
    bar: "bg-plum",
    icon: BookOpen,
  },
  {
    title: "Founders & PMs",
    body: "Skip the SQL, ask the question, get a chart you can drop in a deck.",
    text: "text-rust",
    bar: "bg-rust",
    icon: Rocket,
  },
];

const FILE_TYPES = ["CSV", "XLSX", "JSON", "PDF"];

const STATS = [
  { value: "100%", label: "Claims traced to a source file", color: "text-clay" },
  { value: "4", label: "File types supported", color: "text-plum" },
  { value: "Live", label: "Streamed investigation trace", color: "text-rust" },
];

// Illustrative only - mock data purely to show the shape of what an
// investigation can hand back (see the "Charts, generated on demand"
// section). Hand-rolled SVG/CSS so this doesn't pull in a charting library
// for what's essentially marketing decoration.
function MiniBarChart() {
  const data = [35, 62, 48, 90, 73, 55, 88];
  const max = Math.max(...data);
  return (
    <div className="flex h-24 items-end gap-1.5">
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

function MiniAreaChart() {
  const data = [20, 35, 30, 50, 45, 65, 60, 80, 75, 95];
  const w = 200;
  const h = 96;
  const max = Math.max(...data);
  const step = w / (data.length - 1);
  const line = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full text-plum" preserveAspectRatio="none">
      <defs>
        <linearGradient id="homeAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#homeAreaFill)" />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MiniDonutChart() {
  const segments = [
    { value: 42, stroke: "stroke-accent", dot: "bg-accent" },
    { value: 28, stroke: "stroke-gold", dot: "bg-gold" },
    { value: 18, stroke: "stroke-plum", dot: "bg-plum" },
    { value: 12, stroke: "stroke-clay", dot: "bg-clay" },
  ];
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const r = 34;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex h-24 items-center justify-center gap-4">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="10" className="stroke-border" />
        {segments.map((seg, i) => {
          const len = (seg.value / total) * circumference;
          const el = (
            <circle
              key={i}
              cx="40"
              cy="40"
              r={r}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={-offset}
              className={seg.stroke}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <ul className="space-y-1.5 text-xs text-muted">
        {segments.map((seg, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${seg.dot}`} />
            {seg.value}%
          </li>
        ))}
      </ul>
    </div>
  );
}

const CHARTS = [
  { title: "Revenue by region", body: "Bar charts from a single question.", chart: MiniBarChart },
  { title: "Trend over time", body: "Spot a trajectory at a glance.", chart: MiniAreaChart },
  { title: "Category breakdown", body: "See how a total splits up.", chart: MiniDonutChart },
];

function CTAButton() {
  const { data: user, isLoading: loading } = useGetMeQuery();
  if (loading) return null;
  if (user) {
    return (
      <Link
        href="/chat"
        className="rounded-full bg-accent px-6 py-3 text-white font-medium shadow-card transition-all hover:bg-accent-dark hover:shadow-[0_0_40px_-8px_rgba(204,120,92,0.6)]"
      >
        My Workspace
      </Link>
    );
  }
  return (
    <GoogleLoginButton
      label="Get started"
      className="rounded-full bg-accent px-6 py-3 text-white font-medium shadow-card transition-all hover:bg-accent-dark hover:shadow-[0_0_40px_-8px_rgba(204,120,92,0.6)]"
    />
  );
}

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <main>
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 text-center"
      >
        <div className="glow-blob animate-float-a -top-24 -left-24 h-96 w-96 bg-accent" />
        <div className="glow-blob animate-float-b top-32 -right-20 h-80 w-80 bg-gold" />
        <div className="glow-blob animate-float-c bottom-0 left-1/3 h-72 w-72 bg-plum" />
        <SpotlightCursor
          config={{
            containerRef: heroRef,
            overlayColor: "245, 244, 238",
            overlayOpacity: 0.15,
            glowColor: "204, 120, 92",
            spotlightIntensity: 0.4,
            spotlightSize: 260,
          }}
        />

        <div className="relative z-20 mx-auto max-w-4xl">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs text-muted shadow-card backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            No answer without evidence traced to a real file
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
            Talk to your data files.
            <br />
            Get answers you can{" "}
            <span className="bg-gradient-to-r from-accent to-rust bg-clip-text text-transparent">
              put your name on.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-muted text-lg">
            Drop a spreadsheet, a contract, or a stack of PDFs into a private
            workspace. A crew of specialized agents reads through it,
            cross-checks its own numbers, and hands back an answer - with the
            exact file, row, or page it came from attached.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <CTAButton />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
            <span>Works with</span>
            {FILE_TYPES.map((t) => (
              <span
                key={t}
                className="animate-chip-drift rounded-full border border-border bg-card px-3 py-1 font-medium text-text"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <a
          href="#product"
          className="absolute z-20 bottom-8 flex flex-col items-center gap-2 text-xs text-muted transition-colors hover:text-accent-dark"
        >
          Scroll to explore
          <span className="flex h-8 w-5 items-start justify-center rounded-full border border-border p-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent" />
          </span>
        </a>
      </section>

      {/* Stats strip */}
      <section className="relative z-30 -mt-10 px-6">
        <Reveal className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-card border border-border bg-card shadow-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {STATS.map((s) => (
              <div key={s.label} className="p-6 text-center">
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="mt-1 text-xs text-muted leading-relaxed">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Charts, generated on demand */}
      <section className="px-6 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Not just an answer - a chart, when you need one
          </h2>
          <p className="mt-3 text-muted">
            Ask for a breakdown and get a real visual back, saved to your
            workspace alongside the investigation that produced it.
          </p>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-3">
          {CHARTS.map((c, i) => (
            <Reveal key={c.title} delay={i * 100}>
              <div className="h-full rounded-card border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:border-accent/25 hover:shadow-[0_0_35px_-12px_rgba(204,120,92,0.4)]">
                <c.chart />
                <h3 className="mt-4 font-semibold">{c.title}</h3>
                <p className="mt-1.5 text-sm text-muted leading-relaxed">
                  {c.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Product showcase */}
      <section id="product" className="mt-16 border-t border-border bg-card/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              A conversation, not a query builder
            </h2>
            <p className="mt-3 text-muted">
              Ask a question the way you'd ask a coworker. Watch the agents
              investigate live, then get an answer with the evidence attached.
            </p>
          </Reveal>

          <Reveal delay={120} className="relative mt-14">
            <div className="glow-blob h-64 w-64 bg-accent opacity-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div className="relative mx-auto max-w-3xl overflow-hidden rounded-card border border-accent/15 bg-card shadow-[0_0_50px_-20px_rgba(204,120,92,0.35)] transition-shadow hover:shadow-[0_0_60px_-15px_rgba(204,120,92,0.55)]">
              <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-rust/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-gold/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-plum/70" />
                <span className="ml-3 text-xs text-muted">
                  Q3-sales-report.chat
                </span>
              </div>

              <div className="space-y-4 p-6">
                <div className="ml-auto max-w-sm rounded-2xl rounded-tr-sm bg-accent px-4 py-2.5 text-sm text-white">
                  Which region underperformed last quarter, and by how much?
                </div>

                <div className="space-y-1.5 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-clay" />
                    Running a deterministic query against sales.parquet
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-plum" />
                    Comparing quarter-over-quarter totals by region
                  </div>
                </div>

                <div className="max-w-lg rounded-2xl rounded-tl-sm border border-border bg-bg px-4 py-3 text-sm leading-relaxed">
                  The <strong>West region</strong> underperformed, closing Q3
                  at <strong>$412K</strong> against a $560K target - a{" "}
                  <strong>26% miss</strong>. East and Central both beat
                  target.
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-dark">
                      sales.parquet - rows 118-204
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[40, 70, 100, 55, 85, 30].map((h, i) => (
                    <span
                      key={i}
                      className="flex h-16 items-end rounded-md bg-bg p-1"
                    >
                      <span
                        className="w-full rounded-sm bg-gradient-to-t from-accent to-gold"
                        style={{ height: `${h}%` }}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              From raw file to a cited answer, in one conversation.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 120}>
                <div className="h-full rounded-card border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:border-accent/25 hover:shadow-[0_0_35px_-12px_rgba(204,120,92,0.4)]">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-card ${step.color}`}
                  >
                    {step.n}
                  </div>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative overflow-hidden border-t border-border bg-card/60">
        <div className="glow-blob animate-float-c -top-10 -right-16 h-72 w-72 bg-gold opacity-20" />
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <Reveal className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Built for careful analysis
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Every design decision favors verifiable answers over
              confident-sounding ones.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 text-left">
            {FEATURES.map((card, i) => (
              <Reveal key={card.title} delay={(i % 3) * 100}>
                <div className="relative h-full overflow-hidden rounded-card border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:border-accent/25 hover:shadow-[0_0_40px_-10px_rgba(204,120,92,0.4)]">
                  <span className={`absolute inset-x-0 top-0 h-1 ${card.color}`} />
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

      {/* Why it's different */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <Reveal className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Why not just ask a chatbot?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Generic chatbots guess. Agentlytics investigates.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-card border border-dashed border-border bg-bg p-7">
                <h3 className="text-sm font-semibold text-muted">
                  Without Agentlytics
                </h3>
                <ul className="mt-4 space-y-3">
                  {WITHOUT.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-muted"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[11px] text-muted">
                        &times;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="relative h-full overflow-hidden rounded-card border border-accent/30 bg-accent-soft/40 p-7 shadow-[0_0_50px_-15px_rgba(204,120,92,0.5)]">
                <span className="absolute right-5 top-5 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Agentlytics
                </span>
                <h3 className="text-sm font-semibold text-accent-dark">
                  With Agentlytics
                </h3>
                <ul className="mt-4 space-y-3">
                  {WITH.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-text"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                        &#10003;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Personas */}
      <section className="relative overflow-hidden border-t border-border bg-card/60">
        <div className="glow-blob animate-float-a -bottom-16 -left-16 h-72 w-72 bg-plum opacity-20" />
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <Reveal className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Who it's for
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Anyone who's tired of re-deriving the same numbers by hand.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PERSONAS.map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <div className="relative h-full overflow-hidden rounded-card border border-border bg-card p-6 pl-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-[0_0_35px_-14px_rgba(0,0,0,0.25)]">
                  <span className={`absolute inset-y-0 left-0 w-1.5 ${p.bar}`} />
                  <p.icon className={`h-5 w-5 ${p.text}`} />
                  <h3 className={`mt-2 font-semibold ${p.text}`}>{p.title}</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-border">
        <div className="glow-blob animate-float-b top-0 right-1/4 h-80 w-80 bg-accent opacity-30" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Stop taking the model's word for it.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Create a workspace, upload your first file, and ask your first
              question - free to start.
            </p>
            <div className="mt-8 flex justify-center">
              <CTAButton />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-6 w-6 rounded-md bg-accent" />
                <span className="font-semibold tracking-tight">
                  Agentlytics
                </span>
              </div>
              <p className="mt-3 max-w-xs text-sm text-muted leading-relaxed">
                Answers you can trace back to a real file, every time.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold">Product</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li>
                  <Link href="/chat" className="hover:text-text transition-colors">
                    Workspace
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold">Account</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li>
                  <Link href="/profile" className="hover:text-text transition-colors">
                    Profile
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold">Built on</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li>
                  <Link href="/about" className="hover:text-text transition-colors">
                    About
                  </Link>
                </li>
                <li>Isolated, specialized investigation agents</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row">
            <span>&copy; {new Date().getFullYear()} Agentlytics</span>
            <span>No answer without evidence traced to a real file.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
