// @ts-nocheck
"use client";
import { useEffect, useRef, useState } from "react";

// cursify's Spotlight Cursor hook, adapted to optionally scope itself to a
// container (containerRef) instead of the whole viewport - see
// components/cursor/SpotlightCursor.tsx for why (a full-page 85%-black
// overlay is great for a dark hero, but would blind the rest of the app).
const useSpotlightEffect = (config = {}) => {
  const {
    spotlightSize = 200,
    spotlightIntensity = 0.8,
    fadeSpeed = 0.1,
    glowColor = "255, 255, 255",
    pulseSpeed = 2000,
    overlayColor = "0, 0, 0",
    overlayOpacity = 0.85,
    containerRef = null,
  } = config;

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const spotlightPos = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    const target = containerRef?.current || null;
    const moveTarget = target || document;

    const resizeCanvas = () => {
      if (target) {
        const rect = target.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    const lerp = (start, end, factor) => start + (end - start) * factor;

    const handleMouseMove = (e) => {
      if (target) {
        const rect = target.getBoundingClientRect();
        targetPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      } else {
        targetPos.current = { x: e.clientX, y: e.clientY };
      }
      setIsHovered(true);
    };

    const handleMouseLeave = () => setIsHovered(false);

    const render = () => {
      if (!canvas || !ctx) return;

      spotlightPos.current.x = lerp(spotlightPos.current.x, targetPos.current.x, fadeSpeed);
      spotlightPos.current.y = lerp(spotlightPos.current.y, targetPos.current.y, fadeSpeed);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = `rgba(${overlayColor}, ${overlayOpacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const pulseScale = 1 + 0.1 * Math.sin((Date.now() / pulseSpeed) * Math.PI * 2);
      const currentSpotlightSize = spotlightSize * pulseScale;

      const gradient = ctx.createRadialGradient(
        spotlightPos.current.x,
        spotlightPos.current.y,
        0,
        spotlightPos.current.x,
        spotlightPos.current.y,
        currentSpotlightSize
      );
      gradient.addColorStop(0, `rgba(${glowColor}, ${spotlightIntensity})`);
      gradient.addColorStop(0.5, `rgba(${glowColor}, ${spotlightIntensity * 0.5})`);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(spotlightPos.current.x, spotlightPos.current.y, currentSpotlightSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";
      const glowGradient = ctx.createRadialGradient(
        spotlightPos.current.x,
        spotlightPos.current.y,
        0,
        spotlightPos.current.x,
        spotlightPos.current.y,
        currentSpotlightSize * 1.2
      );
      glowGradient.addColorStop(0, `rgba(${glowColor}, 0.2)`);
      glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(spotlightPos.current.x, spotlightPos.current.y, currentSpotlightSize * 1.2, 0, Math.PI * 2);
      ctx.fill();

      animationFrame.current = requestAnimationFrame(render);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    moveTarget.addEventListener("mousemove", handleMouseMove);
    moveTarget.addEventListener("mouseleave", handleMouseLeave);

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      moveTarget.removeEventListener("mousemove", handleMouseMove);
      moveTarget.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [
    spotlightSize,
    spotlightIntensity,
    fadeSpeed,
    glowColor,
    pulseSpeed,
    overlayColor,
    overlayOpacity,
    containerRef,
  ]);

  return canvasRef;
};

export default useSpotlightEffect;
