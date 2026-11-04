"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useGetFileTablePageQuery } from "@/lib/api/apiSlice";
import type { FileViewInfo } from "@/lib/types";
import { viewerErrorMessage } from "./viewerUtils";

const PAGE_SIZES = [50, 100, 250, 500];

export default function TableView({ info, onUnavailable }: { info: FileViewInfo; onUnavailable?: () => void }) {
  const [sheet, setSheet] = useState<string | null>(info.sheets[0]?.name ?? null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);
  const { data, error, isFetching, isLoading } = useGetFileTablePageQuery({
    fileId: info.id,
    sheet,
    offset,
    limit,
  });

  if (error && !data) {
    const message = viewerErrorMessage(error, "This file couldn't be previewed.");
    return <ViewerMessage message={message} onDownload={onUnavailable} />;
  }

  const rows = data?.rows ?? [];
  const firstRow = rows.length ? offset + 1 : 0;
  const lastRow = offset + rows.length;
  const canNext = !!data?.has_more;

  function selectSheet(name: string) {
    setSheet(name);
    setOffset(0);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {info.sheets.length > 1 && (
        <div role="tablist" aria-label="Sheets" className="flex shrink-0 gap-1 overflow-x-auto border-b border-border bg-bg px-3 pt-2">
          {info.sheets.map((s) => (
            <button
              key={s.name}
              type="button"
              role="tab"
              aria-selected={sheet === s.name}
              onClick={() => selectSheet(s.name)}
              className={`shrink-0 rounded-t-lg border border-b-0 px-3 py-1.5 text-xs font-medium transition-colors ${
                sheet === s.name
                  ? "border-border bg-card text-text"
                  : "border-transparent text-muted hover:bg-card/60 hover:text-text"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className="relative min-h-0 flex-1 overflow-auto bg-card">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading rows...
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">This sheet is empty.</div>
        ) : (
          <table className={`border-separate border-spacing-0 text-xs ${isFetching ? "opacity-60" : ""}`}>
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-20 min-w-12 border-b border-r border-border bg-bg px-2 py-1.5 text-right font-medium text-muted" />
                {data?.columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="sticky top-0 z-10 min-w-24 border-b border-r border-border bg-bg px-3 py-1.5 text-center font-medium text-muted"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => {
                const rowNumber = offset + rowIndex + 1;
                const isHeader = rowNumber === 1;
                return (
                  <tr key={rowNumber} className="hover:bg-accent-soft/30">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 border-b border-r border-border bg-bg px-2 py-1.5 text-right font-normal tabular-nums text-muted"
                    >
                      {rowNumber}
                    </th>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        title={cell.length > 60 ? cell : undefined}
                        className={`max-w-[28rem] truncate whitespace-pre border-b border-r border-border px-3 py-1.5 ${
                          isHeader ? "bg-accent-soft/40 font-semibold text-text" : "text-text"
                        } ${/^-?[\d.,]+%?$/.test(cell) ? "text-right tabular-nums" : ""}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-bg px-4 py-2 text-xs text-muted">
        <span>
          {rows.length > 0 ? (
            <>
              Rows {firstRow.toLocaleString()}-{lastRow.toLocaleString()}
              {data?.total_rows != null ? ` of ${data.total_rows.toLocaleString()}` : canNext ? " of many" : ""}
            </>
          ) : (
            "No rows"
          )}
          {data?.truncated_columns && <span className="ml-2 text-accent-dark">Showing the first 200 columns</span>}
        </span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5">
            Rows per page
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setOffset(0);
              }}
              className="rounded-md border border-border bg-card px-1.5 py-1 text-xs text-text"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            aria-label="Previous page"
            disabled={offset === 0 || isFetching}
            onClick={() => setOffset((o) => Math.max(0, o - limit))}
            className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-text hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next page"
            disabled={!canNext || isFetching}
            onClick={() => setOffset((o) => o + limit)}
            className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-text hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ViewerMessage({ message, onDownload }: { message: string; onDownload?: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="max-w-sm text-sm text-muted">{message}</p>
      {onDownload && (
        <button
          type="button"
          onClick={onDownload}
          className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-text hover:border-accent hover:text-accent-dark"
        >
          Download instead
        </button>
      )}
    </div>
  );
}
