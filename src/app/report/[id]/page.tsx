"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useGetReportQuery } from "@/lib/api/apiSlice";
import AutoHeightIframe from "@/components/AutoHeightIframe";

// Past this many data rows, rendering the full table gets sluggish and mostly unreadable anyway
// - show a preview plus a note instead. The download button always has the complete file.
const CSV_PREVIEW_ROW_LIMIT = 500;

// Small, dependency-free CSV parser (quote-aware: handles quoted fields containing commas,
// newlines, and "" as an escaped quote) - avoids pulling in a new npm package just for this one
// preview table. Not a full RFC 4180 implementation, but covers what pandas/csv.writer produce,
// which is all this ever needs to read (these files are all generated server-side by our own
// sandbox, never arbitrary user uploads).
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  // Last field/row, if the file didn't end with a trailing newline.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

function CsvTable({ url }: { url: string }) {
  const [rawText, setRawText] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setRawText(null);
    setError(false);
    fetch(url)
      .then((res) => res.text())
      .then(setRawText)
      .catch(() => setError(true));
  }, [url]);

  const parsed = useMemo(() => (rawText != null ? parseCsv(rawText) : null), [rawText]);

  if (error) {
    return <p className="text-sm text-rust">Couldn't load the CSV preview - the download button below still works.</p>;
  }
  if (!parsed) {
    return <p className="text-sm text-muted">Loading preview...</p>;
  }
  if (parsed.length === 0) {
    return <p className="text-sm text-muted">This CSV is empty.</p>;
  }

  const [headers, ...dataRows] = parsed;
  const previewRows = dataRows.slice(0, CSV_PREVIEW_ROW_LIMIT);
  const hiddenRows = dataRows.length - previewRows.length;

  return (
    <div>
      <div className="overflow-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="whitespace-nowrap border-b border-border bg-bg px-3 py-2 text-left font-semibold text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, ri) => (
              <tr key={ri} className="hover:bg-bg/60">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="whitespace-nowrap border-b border-border/60 px-3 py-1.5 text-text"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-muted">
        {dataRows.length} row{dataRows.length === 1 ? "" : "s"} · {headers.length} column
        {headers.length === 1 ? "" : "s"}
        {hiddenRows > 0 ? ` · showing first ${previewRows.length} rows - download for the rest` : ""}
      </p>
    </div>
  );
}

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const { data: report, isError, isLoading } = useGetReportQuery(params.id);
  const [markdown, setMarkdown] = useState<string | null>(null);

  useEffect(() => {
    if (report?.format === "markdown" && report.url) {
      fetch(report.url)
        .then((res) => res.text())
        .then(setMarkdown)
        .catch(() => setMarkdown(null));
    }
  }, [report?.format, report?.url]);

  if (isError) return <div className="p-10 text-center text-rust">Failed to load report</div>;
  if (isLoading || !report) return <div className="p-10 text-center text-muted">Loading...</div>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-xl font-semibold mb-1">{report.title}</h1>
      <p className="text-xs text-muted mb-6">
        {new Date(report.created_at).toLocaleString()}
      </p>

      {report.status !== "ready" && (
        <div className="rounded-card border border-border bg-card p-6 shadow-card text-sm text-muted">
          {report.status === "generating"
            ? "Still generating..."
            : `Failed to generate${report.error ? `: ${report.error}` : "."}`}
        </div>
      )}

      {report.status === "ready" && report.format === "markdown" && (
        <div className="markdown rounded-card border border-border bg-card p-8 shadow-card">
          {markdown ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          ) : (
            <p className="text-muted text-sm">Loading content...</p>
          )}
        </div>
      )}

      {report.status === "ready" && report.format === "csv" && report.url && (
        <div className="rounded-card border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted">This report is a CSV export.</p>
            <a
              href={report.url}
              download
              className="inline-block shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition-colors"
            >
              Download CSV
            </a>
          </div>
          <CsvTable url={report.url} />
        </div>
      )}

      {report.status === "ready" && report.format === "html" && report.url && (
        <AutoHeightIframe
          src={report.url}
          title={report.title}
          className="w-full rounded-card border border-border bg-card shadow-card"
        />
      )}
    </main>
  );
}
