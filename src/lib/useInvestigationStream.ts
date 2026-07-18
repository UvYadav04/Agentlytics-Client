"use client";

import { useEffect, useRef, useState } from "react";
import { investigationStreamUrl } from "./sse";
import type { InvestigationEvent } from "./types";

const TERMINAL_TYPES = new Set(["completed", "cancelled", "error"]);

export function useInvestigationStream(
  investigationId: string | null,
  onTerminal: () => void
) {
  const [events, setEvents] = useState<InvestigationEvent[]>([]);
  const onTerminalRef = useRef(onTerminal);
  onTerminalRef.current = onTerminal;

  useEffect(() => {
    setEvents([]);
    if (!investigationId) return;

    const es = new EventSource(investigationStreamUrl(investigationId), {
      withCredentials: true,
    });

    es.onmessage = (e) => {
      try {
        const parsed: InvestigationEvent = JSON.parse(e.data);
        setEvents((prev) => [...prev, parsed]);
        if (TERMINAL_TYPES.has(parsed.type)) {
          es.close();
          onTerminalRef.current();
        }
      } catch {
        // ignore malformed/comment lines
      }
    };

    return () => es.close();
  }, [investigationId]);

  return events;
}
