"use client";

import { useEffect, useState } from "react";
import useCanvasCursor from "@/hooks/use-canvas-cursor";

function CursorCanvas({ className }: { className: string }) {
  const canvasRef = useCanvasCursor();

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[9998] ${className}`}
    />
  );
}

export default function CanvasCursor({ className = "" }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(finePointer.matches && !reducedMotion.matches);
    update();
    finePointer.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      finePointer.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  return enabled ? <CursorCanvas className={className} /> : null;
}
