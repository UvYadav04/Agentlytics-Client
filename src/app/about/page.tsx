"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Box,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  FileText,
  History,
  Link2,
  MessageCircle,
  Radio,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Table2,
  Terminal,
  UploadCloud,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import SlideNav from "@/components/architecture/SlideNav";
import { useScrollProgress } from "@/hooks/use-scroll-progress";

type Node = { icon: LucideIcon; label: string };

type Stage = {
  id: string;
  n: string;
  kicker: string;
  title: string;
  body: string;
  bg: string;
  text: string;
  border: string;
  hoverBorder: string;
  rows: Node[][];
};

// Nine stops, one straight line from "you dropped a file in" to "here's an
// answer you can check." Each stage gets its own slide so the story reads
// one idea at a time instead of a wall of architecture prose.
const STAGES: Stage[] = [
  {
    id: "ingestion",
    n: "01",
    kicker: "Stage 01",
    title: "Your file lands somewhere private",
    body: "Every file you drop in goes straight into your own workspace - sealed off from every other workspace before a single byte of it is read. From there it's queued, so a 400MB export never blocks the rest of the app for you or anyone else.",
    bg: "bg-accent",
    text: "text-accent-dark",
    border: "border-accent/25",
    hoverBorder: "hover:border-accent/40",
    rows: [
      [
        { icon: UploadCloud, label: "File uploaded" },
        { icon: ShieldCheck, label: "Private workspace" },
        { icon: Clock, label: "Queued" },
      ],
    ],
  },
  {
    id: "file-handlers",
    n: "02",
    kicker: "Stage 02",
    title: "Ingestion sorts out what it's actually looking at",
    body: "A spreadsheet and a scanned contract don't need the same treatment, so they don't get it. Tabular files are parsed and normalized into a fast, queryable store. Documents are parsed, chunked, and indexed for semantic search. Nothing gets flattened into generic text just to make the pipeline simpler.",
    bg: "bg-gold",
    text: "text-gold",
    border: "border-gold/30",
    hoverBorder: "hover:border-gold/45",
    rows: [
      [
        { icon: Table2, label: "Tabular file" },
        { icon: Database, label: "Columnar store" },
      ],
      [
        { icon: FileText, label: "Document" },
        { icon: Search, label: "Chunked & indexed" },
      ],
    ],
  },
  {
    id: "agents",
    n: "03",
    kicker: "Stage 03",
    title: "Your question gets split up and handed off",
    body: "Ask something and it's broken into pieces of work, each handed to a specialized investigation agent running in its own private context. One agent's dead ends never leak into another's reasoning - it only ever sees the findings it actually needs. That isolation is what keeps one line of inquiry from polluting another.",
    bg: "bg-plum",
    text: "text-plum",
    border: "border-plum/30",
    hoverBorder: "hover:border-plum/45",
    rows: [
      [
        { icon: Sparkles, label: "Your question" },
        { icon: Bot, label: "Orchestrator" },
        { icon: Box, label: "Isolated agent" },
      ],
    ],
  },
  {
    id: "agents-tools",
    n: "04",
    kicker: "Stage 04",
    title: "Agents don't answer from memory",
    body: "Every number or fact an agent reports comes from calling a tool that runs a real computation against your actual files - a real query, a real retrieval, never a guess dressed up as one. The model reasons over what the tool hands back; it doesn't get to invent the result.",
    bg: "bg-clay",
    text: "text-clay",
    border: "border-clay/30",
    hoverBorder: "hover:border-clay/45",
    rows: [
      [
        { icon: Bot, label: "Agent" },
        { icon: Wrench, label: "Deterministic tool" },
        { icon: CheckCircle2, label: "Real result" },
      ],
    ],
  },
  {
    id: "sandbox",
    n: "05",
    kicker: "Stage 05",
    title: "Custom analysis runs in a box it can't escape",
    body: "When an investigation calls for something beyond a standard lookup, that generated code runs inside an isolated sandbox with no access to the host system or any other workspace. Whatever it does, it does inside a disposable environment that gets thrown away right after.",
    bg: "bg-rust",
    text: "text-rust",
    border: "border-rust/30",
    hoverBorder: "hover:border-rust/45",
    rows: [
      [
        { icon: Terminal, label: "Generated code" },
        { icon: Box, label: "Isolated sandbox" },
        { icon: Server, label: "Host stays untouched" },
      ],
    ],
  },
  {
    id: "worker",
    n: "06",
    kicker: "Stage 06",
    title: "A worker picks up the job in the background",
    body: "Investigations don't run inside the same process that's serving your requests. Each one gets handed off to a dedicated worker that pulls jobs off a queue, runs them in the background, and keeps going even if you close the tab or your connection drops.",
    bg: "bg-accent-dark",
    text: "text-accent-dark",
    border: "border-accent/25",
    hoverBorder: "hover:border-accent/40",
    rows: [
      [
        { icon: Clock, label: "Job queue" },
        { icon: Cpu, label: "Worker service" },
        { icon: RefreshCw, label: "Keeps running" },
      ],
    ],
  },
  {
    id: "redis",
    n: "07",
    kicker: "Stage 07",
    title: "Redis is the nervous system underneath it all",
    body: "It's the piece connecting parts that never talk to each other directly - holding the queue the worker pulls jobs from, and carrying the live progress events the worker publishes while an investigation runs. The API, the worker, and your browser all stay in sync through it.",
    bg: "bg-gold",
    text: "text-gold",
    border: "border-gold/30",
    hoverBorder: "hover:border-gold/45",
    rows: [
      [
        { icon: Server, label: "API" },
        { icon: Zap, label: "Redis" },
        { icon: Cpu, label: "Worker" },
      ],
    ],
  },
  {
    id: "communicator",
    n: "08",
    kicker: "Stage 08",
    title: "You watch it happen, live",
    body: "Your browser doesn't poll for updates - it opens a live stream that subscribes to those Redis events and renders each step as it happens. Refresh mid-investigation and everything that already ran replays first, then the live feed picks back up. A dropped connection never costs you your place.",
    bg: "bg-plum",
    text: "text-plum",
    border: "border-plum/30",
    hoverBorder: "hover:border-plum/45",
    rows: [
      [
        { icon: Zap, label: "Redis events" },
        { icon: Radio, label: "Live stream" },
        { icon: MessageCircle, label: "Your browser" },
      ],
      [{ icon: History, label: "Reconnect replays history first" }],
    ],
  },
  {
    id: "answer",
    n: "09",
    kicker: "Stage 09",
    title: "An answer you can actually check",
    body: "When the investigation wraps up, the findings get assembled into a final answer - and every claim in it carries a reference back to the exact file, row, or page it came from, plus a chart or report if one was useful along the way. That's the whole point: something you can verify, not just believe.",
    bg: "bg-clay",
    text: "text-clay",
    border: "border-clay/30",
    hoverBorder: "hover:border-clay/45",
    rows: [
      [
        { icon: Bot, label: "Findings" },
        { icon: Link2, label: "Linked to source" },
        { icon: CheckCircle2, label: "Answer you can check" },
      ],
    ],
  },
];

const SLIDES = STAGES.map((s) => ({ id: s.id, label: s.title }));

function DiagramChain({ nodes, text }: { nodes: Node[]; text: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {nodes.map((node, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex w-20 flex-col items-center gap-1.5 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-bg shadow-card transition-transform hover:scale-110">
              <node.icon
                className={`h-5 w-5 animate-icon-breathe ${text}`}
                strokeWidth={1.75}
              />
            </span>
            <span className="text-[11px] leading-tight text-muted">
              {node.label}
            </span>
          </div>
          {i < nodes.length - 1 && (
            <ArrowRight className="h-4 w-4 shrink-0 text-border" />
          )}
        </div>
      ))}
    </div>
  );
}

function DiagramPanel({ stage }: { stage: Stage }) {
  return (
    <div
      className={`overflow-hidden rounded-card border bg-card shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)] ${stage.border}`}
    >
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rust/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-gold/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-plum/70" />
        <span className="ml-3 text-xs text-muted">
          stage-{stage.n}.{stage.id}
        </span>
      </div>
      <div className="space-y-4 p-5 sm:p-6">
        {stage.rows.map((row, ri) => (
          <DiagramChain key={ri} nodes={row} text={stage.text} />
        ))}
      </div>
    </div>
  );
}

// Thin dashed line + chevron between two stage slides - a small, literal
// nod to "this flows into the next thing," without restructuring the
// alternating-panel layout above it.
function FlowConnector({ color }: { color: string }) {
  return (
    <div className="relative flex justify-center py-2">
      <svg width="2" height="56" className="overflow-visible">
        <line
          x1="1"
          y1="0"
          x2="1"
          y2="56"
          stroke="currentColor"
          strokeWidth="2"
          className={`animate-flow-dash ${color}`}
        />
      </svg>
    </div>
  );
}

export default function AboutPage() {
  const progress = useScrollProgress();

  return (
    <main className="grid-bg relative">
      {/* Scroll progress rail - thin, top of viewport, tracks how far into
          the pipeline story the reader has gotten. */}
      <div className="fixed inset-x-0 top-0 z-40 h-[3px] bg-border/60">
        <div
          className="h-full bg-gradient-to-r from-accent to-rust transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <SlideNav slides={SLIDES} />

      {/* Title */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
        <div className="glow-blob animate-float-a -top-16 -left-16 h-72 w-72 bg-accent opacity-20" />
        <div className="glow-blob animate-float-b top-10 -right-16 h-64 w-64 bg-plum opacity-20" />
        <div className="relative mx-auto max-w-2xl">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted shadow-card">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            About Agentlytics - {STAGES.length} stages, one straight line
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            How an answer actually{" "}
            <span className="bg-gradient-to-r from-accent to-rust bg-clip-text text-transparent">
              gets made
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-muted text-lg">
            Agentlytics is a workspace where you hand over messy files and get
            back verifiable answers - not a chatbot that free-associates
            numbers at you. Here's the full trip a file takes, from the
            moment it lands to the moment a claim carries a citation.
          </p>
        </div>
      </section>

      {/* One slide per stage, alternating left/right, with a dashed
          connector dropped between consecutive stages to read as a single
          flowing pipeline rather than nine disconnected cards. */}
      {STAGES.map((stage, i) => (
        <div key={stage.id}>
          <section
            id={stage.id}
            className="relative scroll-mt-24 overflow-hidden border-t border-border px-6 py-10"
          >
            <div
              className={`glow-blob h-72 w-72 opacity-[0.1] ${stage.bg} ${
                i % 2 === 0 ? "-right-20 top-1/3" : "-left-20 top-1/3"
              }`}
            />
            <div
              className={`relative mx-auto w-full max-w-5xl rounded-card border border-transparent p-6 transition-colors sm:p-8 ${stage.hoverBorder}`}
            >
              <div
                className={`flex flex-col items-center gap-8 lg:flex-row ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <Reveal className="flex-1">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${stage.bg} text-white`}
                  >
                    {stage.kicker}
                  </span>
                  <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
                    {stage.title}
                  </h2>
                  <p className="mt-4 text-muted leading-relaxed">{stage.body}</p>
                </Reveal>

                <Reveal delay={120} className="w-full flex-1">
                  <DiagramPanel stage={stage} />
                </Reveal>
              </div>
            </div>
          </section>
          {i < STAGES.length - 1 && <FlowConnector color={stage.text} />}
        </div>
      ))}

      {/* Closing */}
      <section className="relative overflow-hidden border-t border-border bg-card/60 px-6 py-20 text-center">
        <div className="glow-blob animate-float-b top-0 right-1/4 h-80 w-80 bg-accent opacity-25" />
        <Reveal className="relative mx-auto max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            See it run on your own files
          </h2>
          <p className="mx-auto mt-3 text-muted">
            The fastest way to understand the pipeline is to watch it
            investigate something you actually uploaded.
          </p>
          <div className="mt-8">
            <Link
              href="/chat"
              className="rounded-full bg-accent px-6 py-3 text-white font-medium shadow-card transition-all hover:bg-accent-dark hover:shadow-[0_0_40px_-8px_rgba(204,120,92,0.6)]"
            >
              Open your workspace
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
