export function viewerErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { data?: { detail?: unknown } } | undefined)?.data;
  return typeof data?.detail === "string" ? data.detail : fallback;
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
