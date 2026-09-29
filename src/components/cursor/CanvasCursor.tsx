"use client";

import useCanvasCursor from "@/hooks/use-canvas-cursor";


export default function CanvasCursor({ className = "" }: { className?: string }) {
  const canvasRef = useCanvasCursor();

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[9998] ${className}`}
    />
  );
}
