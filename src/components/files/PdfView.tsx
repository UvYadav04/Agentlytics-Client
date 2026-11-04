"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import type { FileViewInfo } from "@/lib/types";
import { ViewerMessage } from "./TableView";

export default function PdfView({ info, onUnavailable }: { info: FileViewInfo; onUnavailable?: () => void }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!info.raw) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    fetch(`${API_BASE_URL}/files/${info.id}/view/raw`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(typeof body?.detail === "string" ? body.detail : "This PDF couldn't be loaded.");
        }
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
        setBlobUrl(objectUrl);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [info.id, info.raw]);

  const src = info.raw ? blobUrl : info.url;

  if (error) return <ViewerMessage message={error} onDownload={onUnavailable} />;
  if (!src) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading PDF...
      </div>
    );
  }
  return <iframe src={src} title={info.filename} className="h-full w-full border-0 bg-card" />;
}
