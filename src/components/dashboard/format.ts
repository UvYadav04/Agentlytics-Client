const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/;

export type ValueFormat = "number" | "currency" | "percent";

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && ISO_DATE.test(value);
}

export function formatValue(value: unknown, format: ValueFormat = "number", compact = false): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value !== "number") return String(value);
  const abs = Math.abs(value);
  const useCompact = compact && abs >= 10_000;
  const options: Intl.NumberFormatOptions = useCompact
    ? { notation: "compact", maximumFractionDigits: 1 }
    : { maximumFractionDigits: abs >= 100 ? 0 : 2 };
  if (format === "currency" && !useCompact && abs < 100 && !Number.isInteger(value)) {
    options.minimumFractionDigits = 2;
  }
  const text = new Intl.NumberFormat(undefined, options).format(value);
  return format === "percent" ? `${text}%` : text;
}

export function formatCategory(value: unknown, spanDays: number | null): string {
  if (value === null || value === undefined) return "(none)";
  if (isIsoDate(value)) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    if (spanDays !== null && spanDays > 62) {
      return date.toLocaleDateString(undefined, { month: "short", year: "2-digit", timeZone: "UTC" });
    }
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
  }
  return String(value);
}

export function dateSpanDays(values: unknown[]): number | null {
  const times = values.filter(isIsoDate).map((v) => new Date(v).getTime()).filter((t) => !Number.isNaN(t));
  if (times.length < 2) return null;
  return (Math.max(...times) - Math.min(...times)) / 86_400_000;
}

export function humanize(column: string, labels: Record<string, string>): string {
  if (labels[column]) return labels[column];
  return column.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
