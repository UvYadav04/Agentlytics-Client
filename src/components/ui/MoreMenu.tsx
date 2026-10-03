"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

export type MoreMenuAction = {
  key: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
  hint?: string;
};

export type MoreMenuItem = MoreMenuAction | "separator";

const MENU_WIDTH = 200;
const GAP = 4;

export default function MoreMenu({
  items,
  label = "More options",
  buttonClassName = "",
  icon: TriggerIcon = MoreHorizontal,
  disabled = false,
  align = "end",
}: {
  items: MoreMenuItem[];
  label?: string;
  buttonClassName?: string;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const actions = items.filter((item): item is MoreMenuAction => item !== "separator");

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 0;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < menuHeight + GAP * 2 && rect.top > menuHeight ? rect.top - menuHeight - GAP : rect.bottom + GAP;
    const preferred = align === "start" ? rect.left : rect.right - MENU_WIDTH;
    const left = Math.min(Math.max(8, preferred), window.innerWidth - MENU_WIDTH - 8);
    setPosition({ top, left });
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const firstEnabled = menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not([disabled])');
    firstEnabled?.focus();

    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      close(false);
    }
    function onDismiss() {
      close(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("resize", onDismiss);
    window.addEventListener("scroll", onDismiss, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("resize", onDismiss);
      window.removeEventListener("scroll", onDismiss, true);
    };
  }, [open, close]);

  function onMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])') ?? []
    );
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape" || e.key === "Tab") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      buttons[(index + 1) % buttons.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      buttons[(index - 1 + buttons.length) % buttons.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      buttons[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      buttons[buttons.length - 1]?.focus();
    }
  }

  if (actions.length === 0) return null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`flex size-6 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-border/60 hover:text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent ${
          open ? "bg-border/60 text-text" : ""
        } ${buttonClassName}`}
      >
        <TriggerIcon className="size-4" />
      </button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            onKeyDown={onMenuKeyDown}
            style={{
              position: "fixed",
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              width: MENU_WIDTH,
            }}
            className="z-[60] rounded-xl border border-border bg-card p-1 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.25)]"
          >
            {items.map((item, index) =>
              item === "separator" ? (
                <div key={`sep-${index}`} role="separator" className="my-1 h-px bg-border" />
              ) : (
                <button
                  key={item.key}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  title={item.hint}
                  onClick={(e) => {
                    e.stopPropagation();
                    close(false);
                    item.onSelect();
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    item.danger
                      ? "text-rust hover:bg-rust/10 focus:bg-rust/10"
                      : "text-text hover:bg-bg focus:bg-bg"
                  }`}
                >
                  {item.icon && <item.icon className="size-3.5 shrink-0" />}
                  <span className="truncate">{item.label}</span>
                </button>
              )
            )}
          </div>,
          document.body
        )}
    </>
  );
}
