"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import type { Components } from "react-markdown";
// react-markdown (v9, unified/rehype under the hood) hands every custom component its
// underlying hast node via the `node` prop - a plain, well-defined tree (table > [thead,
// tbody] > tr > [th|td] > text), regardless of how react-markdown itself renders children.
// Walking that tree ourselves (instead of trying to slice the rendered React children) is what
// lets the compact preview below show "first 4 columns, first 5 rows" without caring how many
// columns/rows the real table actually has.
type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  children?: HastNode[];
};

function extractText(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(extractText).join("");
}

function extractTableData(node: HastNode): { headers: string[]; rows: string[][] } {
  const thead = node.children?.find((c) => c.tagName === "thead");
  const tbody = node.children?.find((c) => c.tagName === "tbody");
  const headerRow = thead?.children?.find((c) => c.tagName === "tr");
  const headers = (headerRow?.children ?? [])
    .filter((c) => c.tagName === "th")
    .map(extractText);
  const rows = (tbody?.children ?? [])
    .filter((c) => c.tagName === "tr")
    .map((tr) => (tr.children ?? []).filter((c) => c.tagName === "td").map(extractText));
  return { headers, rows };
}

// Past this many columns or rows, an assistant-generated table reliably blows past the chat
// bubble's width and either scrolls horizontally inside a tiny box or squishes every column
// unreadably - see the report this was written against. Below the threshold, a plain
// `.markdown table` (see globals.css) renders exactly as before, untouched.
const WIDE_COLUMN_THRESHOLD = 5;
const TALL_ROW_THRESHOLD = 12;
const PREVIEW_COLUMNS = 4;
const PREVIEW_ROWS = 5;

function TableModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="markdown flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-card border border-border bg-card shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-text">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-muted transition-colors hover:bg-bg hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-auto p-5">{children}</div>
      </div>
    </div>
  );
}

import type { ExtraProps } from "react-markdown";
import type { TableHTMLAttributes } from "react";
import type { Element } from "hast";

type MarkdownTableProps =
  TableHTMLAttributes<HTMLTableElement> &
  ExtraProps & {
    node?: Element;
  };
// Swapped in as ReactMarkdown's `table` renderer (see MessageList.tsx) - a narrow/short table
// renders exactly as before (just wrapped for horizontal-scroll safety); a wide/long one shows
// a truncated preview instead, with the FULL table (the same `children` react-markdown already
// built, so any inline markdown/links inside cells still render correctly) one click away in a
// modal sized to the viewport, not the chat column.
export default function MarkdownTable({
  node,
  children,
  ...props
}: MarkdownTableProps) {
  const [open, setOpen] = useState(false);

  if (!node) {
    return (
      <div className="overflow-x-auto">
        <table {...props}>{children}</table>
      </div>
    );
  }

  const { headers, rows } = extractTableData(node);
  const isWide = headers.length > WIDE_COLUMN_THRESHOLD || rows.length > TALL_ROW_THRESHOLD;

  if (!isWide) {
    return (
      <div className="overflow-x-auto">
        <table {...props}>{children}</table>
      </div>
    );
  }

  const previewHeaders = headers.slice(0, PREVIEW_COLUMNS);
  const hiddenColumns = headers.length - previewHeaders.length;
  const previewRows = rows.slice(0, PREVIEW_ROWS);
  const hiddenRows = rows.length - previewRows.length;
  const title = `${headers.length} column${headers.length === 1 ? "" : "s"} × ${rows.length} row${rows.length === 1 ? "" : "s"}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="my-2 block w-full overflow-hidden rounded-lg border border-border bg-card text-left transition-colors hover:border-accent/40 hover:shadow-card"
      >
        <table className="w-full text-xs">
          <thead>
            <tr>
              {previewHeaders.map((h, i) => (
                <th
                  key={i}
                  className="border-b border-border bg-bg px-3 py-2 text-left font-semibold text-muted"
                >
                  {h}
                </th>
              ))}
              {hiddenColumns > 0 && (
                <th className="border-b border-border bg-bg px-3 py-2 text-left font-semibold text-muted">
                  +{hiddenColumns} more
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, ri) => (
              <tr key={ri}>
                {row.slice(0, PREVIEW_COLUMNS).map((cell, ci) => (
                  <td
                    key={ci}
                    className="max-w-[160px] truncate border-b border-border/60 px-3 py-1.5 text-text"
                  >
                    {cell}
                  </td>
                ))}
                {hiddenColumns > 0 && (
                  <td className="border-b border-border/60 px-3 py-1.5 text-muted">…</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between bg-bg px-3 py-2 text-xs font-medium text-accent-dark">
          <span>
            {title}
            {hiddenRows > 0 ? ` · ${hiddenRows} more row${hiddenRows === 1 ? "" : "s"}` : ""}
          </span>
          <span>View full table →</span>
        </div>
      </button>

      {open && (
        <TableModal title={title} onClose={() => setOpen(false)}>
          <table {...props}>{children}</table>
        </TableModal>
      )}
    </>
  );
}
