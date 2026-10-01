"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useReplaceFileCancelMutation,
  useReplaceFileConfirmMutation,
  useReplaceFilePresignMutation,
} from "@/lib/api/apiSlice";
import { API_BASE_URL } from "@/lib/config";
import type { FileItem } from "@/lib/types";

export type ReplaceState = {
  status: "uploading" | "confirming" | "error";
  progress: number;
  error?: string;
};

const TABULAR = new Set(["csv", "xlsx"]);
const DOCUMENTS = new Set(["pdf", "txt"]);

export function replacementAccept(fileType: string): string {
  if (TABULAR.has(fileType)) return `.${fileType}`;
  if (DOCUMENTS.has(fileType)) return ".pdf,.txt";
  return `.${fileType}`;
}

export function replacementError(current: FileItem, next: File): string | null {
  const ext = next.name.split(".").pop()?.toLowerCase() ?? "";
  if (TABULAR.has(current.file_type) && ext !== current.file_type) {
    return `Choose a .${current.file_type} file - replacing with another type would break charts built on it.`;
  }
  if (DOCUMENTS.has(current.file_type) && !DOCUMENTS.has(ext)) {
    return "Choose a .pdf or .txt file.";
  }
  return null;
}

function errorMessage(err: unknown, fallback: string) {
  if (err instanceof Error) return err.message;
  const data = (err as { data?: { detail?: unknown } } | undefined)?.data;
  return typeof data?.detail === "string" ? data.detail : fallback;
}

export function useFileReplace(workspaceId: string) {
  const [states, setStates] = useState<Record<string, ReplaceState>>({});
  const xhrs = useRef<Map<string, XMLHttpRequest>>(new Map());
  const [presign] = useReplaceFilePresignMutation();
  const [confirm] = useReplaceFileConfirmMutation();
  const [cancel] = useReplaceFileCancelMutation();

  const patch = useCallback((fileId: string, next: ReplaceState | null) => {
    setStates((prev) => {
      const copy = { ...prev };
      if (next) copy[fileId] = next;
      else delete copy[fileId];
      return copy;
    });
  }, []);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (xhrs.current.size === 0) return;
      e.preventDefault();
      e.returnValue = "";
    }
    function onPageHide() {
      xhrs.current.forEach((_, fileId) => {
        fetch(`${API_BASE_URL}/files/${fileId}/replace/cancel`, {
          method: "POST",
          credentials: "include",
          keepalive: true,
        }).catch(() => {});
      });
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  const startReplace = useCallback(
    async (current: FileItem, next: File) => {
      const invalid = replacementError(current, next);
      if (invalid) {
        patch(current.id, { status: "error", progress: 0, error: invalid });
        return;
      }
      patch(current.id, { status: "uploading", progress: 0 });
      let presigned = false;
      try {
        const result = await presign({
          fileId: current.id,
          workspaceId,
          filename: next.name,
          contentType: next.type || "application/octet-stream",
          sizeBytes: next.size,
        }).unwrap();
        presigned = true;

        const xhr = new XMLHttpRequest();
        xhrs.current.set(current.id, xhr);
        await new Promise<void>((resolve, reject) => {
          xhr.open("PUT", result.upload_url);
          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
              patch(current.id, { status: "uploading", progress: Math.round((evt.loaded / evt.total) * 100) });
            }
          };
          xhr.onload = () =>
            xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`));
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.onabort = () => reject(new Error("cancelled"));
          xhr.send(next);
        });
        xhrs.current.delete(current.id);

        patch(current.id, { status: "confirming", progress: 100 });
        await confirm({ fileId: current.id, workspaceId }).unwrap();
        patch(current.id, null);
      } catch (err) {
        xhrs.current.delete(current.id);
        const message = errorMessage(err, "Couldn't replace the file.");
        if (presigned) cancel({ fileId: current.id, workspaceId }).catch(() => {});
        if (message === "cancelled") patch(current.id, null);
        else patch(current.id, { status: "error", progress: 0, error: message });
      }
    },
    [workspaceId, presign, confirm, cancel, patch]
  );

  const abortReplace = useCallback((fileId: string) => {
    xhrs.current.get(fileId)?.abort();
  }, []);

  const dismiss = useCallback((fileId: string) => patch(fileId, null), [patch]);

  return { replaceStates: states, startReplace, abortReplace, dismissReplace: dismiss };
}
