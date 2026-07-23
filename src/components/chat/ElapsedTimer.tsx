"use client";

import { useElapsedSeconds } from "@/hooks/use-elapsed-seconds";

function formatElapsed(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

/**
 * Small ticking "12s" / "1m 04s" readout - how long the current request has been running,
 * shown next to the "Starting investigation..."/"Connecting with analyzer..." lines. Renders
 * nothing while startedAt is null (no request in flight).
 */
export default function ElapsedTimer({
  startedAt,
  className = "ml-auto shrink-0 tabular-nums text-muted",
}: {
  startedAt: number | null;
  className?: string;
}) {
  const seconds = useElapsedSeconds(startedAt);
  if (startedAt == null) return null;
  return <span className={className}>{formatElapsed(seconds)}</span>;
}
