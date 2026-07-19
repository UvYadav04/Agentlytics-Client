"use client";

import useSpotlightEffect from "@/hooks/use-spotlight";
import type { HTMLAttributes, RefObject } from "react";

interface SpotlightConfig {
  spotlightSize?: number;
  spotlightIntensity?: number;
  fadeSpeed?: number;
  glowColor?: string;
  pulseSpeed?: number;
  overlayColor?: string;
  overlayOpacity?: number;
  // Scopes the effect to one element instead of the full viewport. Pass a
  // ref to a `position: relative; overflow: hidden` container (e.g. a dark
  // hero section) - without this the dark overlay covers the whole page.
  containerRef?: RefObject<HTMLElement>;
}

interface SpotlightCursorProps extends HTMLAttributes<HTMLCanvasElement> {
  config?: SpotlightConfig;
}

const SpotlightCursor = ({ config = {}, className = "", ...rest }: SpotlightCursorProps) => {
  const spotlightConfig: SpotlightConfig = {
    spotlightSize: 220,
    spotlightIntensity: 0.55,
    fadeSpeed: 0.12,
    glowColor: "204, 120, 92",
    pulseSpeed: 2200,
    overlayColor: "15, 12, 9",
    overlayOpacity: 0.55,
    ...config,
  };

  const canvasRef = useSpotlightEffect(spotlightConfig);
  const position = spotlightConfig.containerRef ? "absolute" : "fixed";

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none ${position} inset-0 top-0 left-0 z-10 h-full w-full ${className}`}
      {...rest}
    />
  );
};

export default SpotlightCursor;
