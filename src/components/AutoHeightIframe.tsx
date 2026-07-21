"use client";

import { useEffect, useRef, useState } from "react";

const MIN_HEIGHT = 240;
const INITIAL_HEIGHT = 480;

/**
 * Renders a sandboxed chart/report iframe with no fixed height. The
 * generated HTML (see reporting_tools.py) posts its real content height via
 * postMessage on load and whenever it resizes - we just mirror that back
 * onto the iframe element. No scrollbar, no clipped/oversized fixed box.
 *
 * Falls back to a fixed INITIAL_HEIGHT until the first message arrives
 * (typically well under a second), and never shrinks below MIN_HEIGHT.
 */
export default function AutoHeightIframe({
  src,
  title,
  className,
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(INITIAL_HEIGHT);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // Scope to this iframe specifically - a page can render several of
      // these at once (e.g. the dashboard grid), and messages from one
      // shouldn't resize another.
      if (event.source !== ref.current?.contentWindow) return;
      const data = event.data;
      if (data && data.source === "data-analyzer-chart" && typeof data.height === "number") {
        setHeight(Math.max(MIN_HEIGHT, Math.ceil(data.height)));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      ref={ref}
      src={src}
      sandbox="allow-scripts"
      scrolling="no"
      className={className}
      style={{ height, border: "none", overflow: "hidden", display: "block" }}
      title={title}
    />
  );
}
