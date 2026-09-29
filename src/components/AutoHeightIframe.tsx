"use client";

import { useEffect, useRef, useState } from "react";

const MIN_HEIGHT = 240;
const INITIAL_HEIGHT = 480;

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
