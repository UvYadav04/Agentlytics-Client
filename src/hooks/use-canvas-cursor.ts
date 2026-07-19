// @ts-nocheck
"use client";
import { useEffect, useRef } from "react";

// cursify's Canvas Cursor hook (the rope/spring "snake" trail effect),
// rewritten to encapsulate all state inside the effect instead of module-
// level globals and getElementById('canvas') - the original snippet breaks
// if more than one instance ever mounts (React StrictMode double-invokes
// effects in dev) and leaks its resize/focus/blur listeners on unmount.
// The physics (Node/Line spring simulation) are unchanged. The original
// also cycled the trail through the full hue wheel via a sine oscillator -
// replaced with a fixed hue matching the app's terracotta accent (#CC785C
// = hsl(15, 55%, 55%)) so the trail reads as "this site's cursor," not a
// rainbow demo effect.
function useCanvasCursor(options = {}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const E = {
      friction: 0.5,
      trails: 20,
      size: 50,
      dampening: 0.25,
      tension: 0.98,
      hue: 15,
      saturation: 55,
      lightness: 55,
      lineOpacity: 0.22,
      ...options,
    };

    let pos = { x: 0, y: 0 };
    let lines = [];
    let animationFrame;
    const ctx = canvasEl.getContext("2d");
    ctx.running = true;
    ctx.frame = 1;

    function Node() {
      this.x = 0;
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
    }

    function Line(cfg) {
      this.spring = cfg.spring + 0.1 * Math.random() - 0.02;
      this.friction = E.friction + 0.01 * Math.random() - 0.002;
      this.nodes = [];
      for (let i = 0; i < E.size; i++) {
        const node = new Node();
        node.x = pos.x;
        node.y = pos.y;
        this.nodes.push(node);
      }
    }
    Line.prototype.update = function () {
      let spring = this.spring;
      let node = this.nodes[0];
      node.vx += (pos.x - node.x) * spring;
      node.vy += (pos.y - node.y) * spring;

      for (let i = 0, len = this.nodes.length; i < len; i++) {
        node = this.nodes[i];
        if (i > 0) {
          const prev = this.nodes[i - 1];
          node.vx += (prev.x - node.x) * spring;
          node.vy += (prev.y - node.y) * spring;
          node.vx += prev.vx * E.dampening;
          node.vy += prev.vy * E.dampening;
        }
        node.vx *= this.friction;
        node.vy *= this.friction;
        node.x += node.vx;
        node.y += node.vy;
        spring *= E.tension;
      }
    };
    Line.prototype.draw = function () {
      let a, b;
      let x = this.nodes[0].x;
      let y = this.nodes[0].y;
      ctx.beginPath();
      ctx.moveTo(x, y);

      let i = 1;
      for (const len = this.nodes.length - 2; i < len; i++) {
        a = this.nodes[i];
        b = this.nodes[i + 1];
        x = 0.5 * (a.x + b.x);
        y = 0.5 * (a.y + b.y);
        ctx.quadraticCurveTo(a.x, a.y, x, y);
      }
      a = this.nodes[i];
      b = this.nodes[i + 1];
      ctx.quadraticCurveTo(a.x, a.y, b.x, b.y);
      ctx.stroke();
      ctx.closePath();
    };

    function initLines() {
      lines = [];
      for (let i = 0; i < E.trails; i++) {
        lines.push(new Line({ spring: 0.4 + (i / E.trails) * 0.025 }));
      }
    }

    function handleMove(evt) {
      if (evt.touches) {
        pos.x = evt.touches[0].pageX;
        pos.y = evt.touches[0].pageY;
      } else {
        pos.x = evt.clientX;
        pos.y = evt.clientY;
      }
      evt.preventDefault();
    }

    function handleTouchStart(evt) {
      if (evt.touches.length === 1) {
        pos.x = evt.touches[0].pageX;
        pos.y = evt.touches[0].pageY;
      }
    }

    function resizeCanvas() {
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
    }

    function render() {
      if (!ctx.running) return;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `hsla(${E.hue}, ${E.saturation}%, ${E.lightness}%, ${E.lineOpacity})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < E.trails; i++) {
        lines[i].update();
        lines[i].draw();
      }
      ctx.frame++;
      animationFrame = window.requestAnimationFrame(render);
    }

    function handleFocus() {
      if (!ctx.running) {
        ctx.running = true;
        render();
      }
    }
    function handleBlur() {
      ctx.running = true;
    }

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleMove);
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    resizeCanvas();
    initLines();
    render();

    return () => {
      ctx.running = false;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleMove);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  return canvasRef;
}

export default useCanvasCursor;
