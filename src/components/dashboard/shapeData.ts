import type { LiveChartConfig, LiveChartData } from "@/lib/types";
import { MAX_SERIES, PIE_MAX_SLICES } from "./chartTheme";
import { dateSpanDays, formatCategory, humanize } from "./format";

export type SeriesDef = { key: string; label: string };

export type ShapedChart = {
  rows: Record<string, number | string | null>[];
  series: SeriesDef[];
  spanDays: number | null;
};

const X_KEY = "__x";
const OTHER_LABEL = "Other";

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value);
  return null;
}

export { X_KEY };

export function shapeChart(config: LiveChartConfig, data: LiveChartData): ShapedChart {
  const xColumn = config.x_column;
  const valueColumns = config.value_columns.filter((c) => data.columns.includes(c));
  const spanDays = xColumn ? dateSpanDays(data.rows.map((r) => r[xColumn])) : null;

  if (config.series_column && xColumn && valueColumns.length > 0) {
    const valueColumn = valueColumns[0];
    const totals = new Map<string, number>();
    for (const row of data.rows) {
      const name = String(row[config.series_column] ?? "(none)");
      totals.set(name, (totals.get(name) ?? 0) + Math.abs(toNumber(row[valueColumn]) ?? 0));
    }
    const ordered = [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
    const kept = (ordered.length > MAX_SERIES ? ordered.slice(0, MAX_SERIES - 1) : ordered).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
    const keptSet = new Set(kept);
    const hasOther = ordered.length > kept.length;
    const series: SeriesDef[] = kept.map((name, i) => ({ key: `s${i}`, label: name }));
    if (hasOther) series.push({ key: "s_other", label: OTHER_LABEL });
    const keyFor = new Map(series.map((s) => [s.label, s.key]));

    const byX = new Map<string, Record<string, number | string | null>>();
    for (const row of data.rows) {
      const rawX = row[xColumn];
      const xKey = String(rawX);
      if (!byX.has(xKey)) byX.set(xKey, { [X_KEY]: formatCategory(rawX, spanDays) });
      const target = byX.get(xKey)!;
      const seriesName: string = String(row[config.series_column] ?? "(none)");
      const key: string = keptSet.has(seriesName) ? keyFor.get(seriesName)! : "s_other";
      const current = typeof target[key] === "number" ? (target[key] as number) : 0;
      target[key] = current + (toNumber(row[valueColumn]) ?? 0);
    }
    return { rows: [...byX.values()], series, spanDays };
  }

  const columns = valueColumns.slice(0, MAX_SERIES);
  const series = columns.map((c) => ({ key: c, label: humanize(c, config.labels) }));
  const rows = data.rows.map((row) => {
    const shaped: Record<string, number | string | null> = {
      [X_KEY]: xColumn ? formatCategory(row[xColumn], spanDays) : "",
    };
    for (const column of columns) shaped[column] = toNumber(row[column]);
    return shaped;
  });
  return { rows, series, spanDays };
}

export function shapePie(config: LiveChartConfig, data: LiveChartData) {
  const xColumn = config.x_column ?? data.columns[0];
  const valueColumn = config.value_columns[0];
  const slices = data.rows
    .map((row) => ({ name: formatCategory(row[xColumn], null), value: toNumber(row[valueColumn]) ?? 0 }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
  const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, undefined, { numeric: true });
  if (slices.length <= PIE_MAX_SLICES) return slices.sort(byName);
  const kept = slices.slice(0, PIE_MAX_SLICES - 1).sort(byName);
  const other = slices.slice(PIE_MAX_SLICES - 1).reduce((sum, s) => sum + s.value, 0);
  return [...kept, { name: OTHER_LABEL, value: other }];
}
