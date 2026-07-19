"use client";

import { useEffect, useState } from "react";

export type SlideNavItem = { id: string; label: string };

// Fixed dot rail down the right edge of the architecture page - highlights
// whichever full-height slide is currently centered in the viewport, and
// jumps there on click. Hidden below `lg` since there's no room for it next
// to a single-column slide on small screens.
export default function SlideNav({ slides }: { slides: SlideNavItem[] }) {
  const [active, setActive] = useState(slides[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    const elements = slides
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [slides]);

  return (
    <nav
      aria-label="Slide navigation"
      className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
    >
      {slides.map((s) => (
        <a key={s.id} href={`#${s.id}`} className="group flex items-center gap-2">
          <span
            className={`whitespace-nowrap text-[11px] font-medium opacity-0 transition-opacity group-hover:opacity-100 ${
              active === s.id ? "text-accent-dark" : "text-muted"
            }`}
          >
            {s.label}
          </span>
          <span
            className={`h-2 w-2 shrink-0 rounded-full transition-all ${
              active === s.id
                ? "scale-125 bg-accent"
                : "bg-border group-hover:bg-accent/50"
            }`}
          />
        </a>
      ))}
    </nav>
  );
}
