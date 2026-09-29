"use client";

import { useElapsedSeconds } from "@/hooks/use-elapsed-seconds";

function formatElapsed(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

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
