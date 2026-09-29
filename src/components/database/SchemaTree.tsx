"use client";

import { useMemo, useState } from "react";
import { ChevronRight, KeyRound, Link2, Search, Table2 } from "lucide-react";
import type { DatabaseSchema, DatabaseSchemaObject, DatabaseType } from "@/lib/types";

const KIND_LABEL: Record<string, string> = {
  table: "table",
  view: "view",
  materialized_view: "mat. view",
  foreign_table: "foreign",
  collection: "collection",
};

function formatCount(value: number | null) {
  if (value === null || value === undefined) return null;
  return new Intl.NumberFormat(undefined, { notation: value >= 10000 ? "compact" : "standard" }).format(value);
}

function qualifiedName(object: DatabaseSchemaObject) {
  return object.schema ? `${object.schema}.${object.name}` : object.name;
}

function ObjectRow({ object, dbType, defaultOpen }: { object: DatabaseSchemaObject; dbType: DatabaseType; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const count = formatCount(object.row_count);
  const countLabel = dbType === "mongodb" ? "docs" : "rows";

  return (
    <li className="rounded-lg border border-border bg-bg/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-2.5 py-2 text-left"
      >
        <ChevronRight className={`size-3.5 shrink-0 text-muted transition-transform ${open ? "rotate-90" : ""}`} />
        <Table2 className="size-3.5 shrink-0 text-accent-dark" />
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-text" title={qualifiedName(object)}>
          {qualifiedName(object)}
        </span>
        <span className="shrink-0 rounded-full bg-border px-1.5 py-0.5 text-[10px] text-muted">
          {KIND_LABEL[object.kind] ?? object.kind}
        </span>
        {count !== null && (
          <span className="shrink-0 text-[10px] text-muted">
            ~{count} {countLabel}
          </span>
        )}
      </button>
      {open && (
        <div className="border-t border-border/70 px-2.5 py-2">
          {object.fields.length === 0 ? (
            <p className="text-[11px] text-muted">
              {dbType === "mongodb" ? "No documents to sample." : "No columns visible to this user."}
            </p>
          ) : (
            <ul className="space-y-1">
              {object.fields.map((field) => (
                <li key={field.name} className="flex items-center gap-2 text-[11px]">
                  {field.primary_key ? (
                    <KeyRound className="size-3 shrink-0 text-gold" aria-label="Primary key" />
                  ) : (
                    <span className="size-3 shrink-0" />
                  )}
                  <span className="min-w-0 flex-1 truncate font-mono text-text" title={field.name}>
                    {field.name}
                  </span>
                  <span className="shrink-0 font-mono text-muted">{field.type}</span>
                  {typeof field.presence === "number" && field.presence < 1 && (
                    <span className="shrink-0 text-muted">{Math.round(field.presence * 100)}%</span>
                  )}
                  {field.nullable === false && !field.primary_key && (
                    <span className="shrink-0 text-muted">not null</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {object.foreign_keys.length > 0 && (
            <ul className="mt-2 space-y-1 border-t border-border/70 pt-2">
              {object.foreign_keys.map((fk) => (
                <li key={`${fk.columns.join(",")}-${fk.references}`} className="flex items-center gap-1.5 text-[11px] text-muted">
                  <Link2 className="size-3 shrink-0" />
                  <span className="font-mono">
                    {fk.columns.join(", ")} → {fk.references}({fk.referenced_columns.join(", ")})
                  </span>
                </li>
              ))}
            </ul>
          )}
          {dbType === "mongodb" && typeof object.sampled === "number" && object.sampled > 0 && (
            <p className="mt-2 text-[10px] text-muted">Fields inferred from {object.sampled} sampled documents.</p>
          )}
        </div>
      )}
    </li>
  );
}

export default function SchemaTree({
  schema,
  dbType,
  maxHeightClass = "max-h-80",
}: {
  schema: DatabaseSchema;
  dbType: DatabaseType;
  maxHeightClass?: string;
}) {
  const [query, setQuery] = useState("");
  const objects = schema.objects;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return objects;
    return objects.filter(
      (o) =>
        qualifiedName(o).toLowerCase().includes(q) ||
        o.fields.some((f) => f.name.toLowerCase().includes(q))
    );
  }, [objects, query]);

  const noun = dbType === "mongodb" ? "collection" : "table";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs text-muted">
          {objects.length} {noun}
          {objects.length === 1 ? "" : "s"}
          {schema.database ? ` in ${schema.database}` : ""}
          {schema.server_version ? ` · v${schema.server_version.split(" ")[0]}` : ""}
          {schema.truncated ? " · showing the first 200" : ""}
        </p>
        {objects.length > 6 && (
          <label className="flex items-center gap-1 rounded-md border border-border bg-bg px-2 py-1">
            <Search className="size-3 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Filter ${noun}s or fields`}
              className="w-40 bg-transparent text-[11px] outline-none placeholder:text-muted"
            />
          </label>
        )}
      </div>
      <ul className={`${maxHeightClass} space-y-1.5 overflow-y-auto pr-1`}>
        {filtered.map((object, index) => (
          <ObjectRow
            key={qualifiedName(object)}
            object={object}
            dbType={dbType}
            defaultOpen={objects.length <= 3 && index === 0}
          />
        ))}
        {filtered.length === 0 && <li className="py-2 text-xs text-muted">Nothing matches that filter.</li>}
      </ul>
    </div>
  );
}
