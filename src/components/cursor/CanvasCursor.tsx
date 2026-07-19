"use client";

import useCanvasCursor from "@/hooks/use-canvas-cursor";


// Global, whole-app cursor trail (cursify's "Canvas Cursor" rope effect).
// Uses an additive "lighter" blend mode at low opacity, so unlike the
// spotlight it never obscures content - safe to mount once in the root
// layout and leave running on every page.
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
