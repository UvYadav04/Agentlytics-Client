"use client";

import { useEffect, useState } from "react";

export function useElapsedSeconds(startedAt: number | null): number {
  const [now, setNow] = useState<number>(() => startedAt ?? Date.now());

  useEffect(() => {
    if (startedAt == null) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  if (startedAt == null) return 0;
  return Math.max(0, Math.floor((now - startedAt) / 1000));
}
