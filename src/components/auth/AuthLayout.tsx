"use client";

import Link from "next/link";
import type { ReactNode } from "react";

// Small, self-contained chart mocks - same illustrative-only spirit as the ones on the
// homepage/get-started page (see app/page.tsx's MiniBarChart), just compact enough to live
// inside a tilted overlapping card here rather than a full section.
function MiniBarChart() {
  const data = [35, 62, 48, 90, 73, 55];
  const max = Math.max(...data);
  return (
    <div className="flex h-14 items-end gap-1">
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
  const data = [20, 35, 30, 50, 45, 65, 60, 80];
  const w = 180;
  const h = 56;
  const max = Math.max(...data);
  const step = w / (data.length - 1);
  const line = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full text-plum" preserveAspectRatio="none">
      <defs>
        <linearGradient id="authAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#authAreaFill)" />
      <polyline points={line} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MiniDonutChart() {
  const segments = [
    { value: 42, stroke: "stroke-accent" },
    { value: 28, stroke: "stroke-gold" },
    { value: 18, stroke: "stroke-plum" },
    { value: 12, stroke: "stroke-clay" },
  ];
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const r = 24;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 60 60" className="h-14 w-14 -rotate-90">
      <circle cx="30" cy="30" r={r} fill="none" strokeWidth="8" className="stroke-border" />
      {segments.map((seg, i) => {
        const len = (seg.value / total) * circumference;
        const el = (
          <circle
            key={i}
            cx="30"
            cy="30"
            r={r}
            fill="none"
            strokeWidth="8"
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
  );
}

// Three tilted, overlapping chart cards - "a few overlapping charts" behind the pitch copy.
// Purely decorative (absolute positioning inside a fixed-height container), matches the
// hand-rolled-SVG-not-a-charting-library approach already used elsewhere in the app.
function OverlappingCharts() {
  return (
    <div className="relative h-64 w-full max-w-sm">
      <div className="absolute left-0 top-2 w-52 -rotate-6 rounded-card border border-border bg-card p-4 shadow-card transition-transform hover:rotate-0">
        <div className="mb-2 text-xs font-medium text-muted">Revenue by region</div>
        <MiniBarChart />
      </div>
      <div className="absolute right-0 top-16 w-48 rotate-3 rounded-card border border-border bg-card p-4 shadow-card transition-transform hover:rotate-0">
        <div className="mb-2 text-xs font-medium text-muted">Trend over time</div>
        <MiniAreaChart />
      </div>
      <div className="absolute bottom-0 left-12 flex w-44 items-center gap-3 rotate-2 rounded-card border border-border bg-card p-4 shadow-card transition-transform hover:rotate-0">
        <MiniDonutChart />
        <div className="text-xs text-muted">
          <div className="font-medium text-text">Category split</div>
          <div>4 segments</div>
        </div>
      </div>
    </div>
  );
}

// Shared shell for /login, /signup, /forgot-password, /verify-email. Two modes:
//  - centered (login/signup): just the boxed form, full-width and centered on screen - no split,
//    no illustration, nothing competing with the form itself.
//  - split (default, forgot-password/verify-email): left half is the wordmark plus the
//    overlapping-charts illustration, right half is the same boxed form. Collapses to a single
//    column below lg.
// Uses min-h-screen (rather than subtracting a navbar height) since the navbar is hidden on
// these routes - see Navbar.tsx's HIDDEN_ON.
export default function AuthLayout({
  children,
  centered = false,
}: {
  children: ReactNode;
  centered?: boolean;
}) {
  if (centered) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2">
            <span className="inline-block h-6 w-6 rounded-md bg-accent" />
            <span className="font-semibold tracking-tight">Agentlytics</span>
          </Link>
          <div className="w-full rounded-card border border-border bg-card p-8 shadow-card">
            {children}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col items-center justify-center gap-14 overflow-hidden border-r border-border bg-card/60 px-12 py-16 lg:flex">
        <div className="glow-blob animate-float-a -top-24 -left-24 h-80 w-80 bg-accent opacity-25" />
        <div className="glow-blob animate-float-b bottom-0 right-0 h-72 w-72 bg-plum opacity-20" />

        <Link href="/" className="relative z-10 text-5xl font-bold tracking-tight">
          Agentlytics
        </Link>

        <div className="relative z-10">
          <OverlappingCharts />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="inline-block h-6 w-6 rounded-md bg-accent" />
            <span className="font-semibold tracking-tight">Agentlytics</span>
          </Link>
          <div className="w-full rounded-card border border-border bg-card p-8 shadow-card">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
