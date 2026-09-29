"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useConfirmUploadMutation,
  useFailUploadMutation,
  usePresignUploadMutation,
} from "@/lib/api/apiSlice";
import { API_BASE_URL } from "@/lib/config";

export type UploadStatus = "uploading" | "confirming" | "done" | "error" | "cancelled";

export type UploadItem = {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  fileId?: string;
  error?: string;
};

type InternalItem = UploadItem & { xhr?: XMLHttpRequest };

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useFileUploads(workspaceId: string) {
  const [uploads, setUploads] = useState<InternalItem[]>([]);
  const [presignUpload] = usePresignUploadMutation();
  const [confirmUpload] = useConfirmUploadMutation();
  const [failUpload] = useFailUploadMutation();

  const activeFileIdsRef = useRef<Set<string>>(new Set());

  const patch = useCallback((id: string, next: Partial<InternalItem>) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...next } : u)));
  }, []);

  const remove = useCallback((id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (activeFileIdsRef.current.size === 0) return;
      e.preventDefault();
      e.returnValue = "";
    }

    function handlePageHide() {
      activeFileIdsRef.current.forEach((fileId) => {
        fetch(`${API_BASE_URL}/files/${fileId}/cancel`, {
          method: "POST",
          credentials: "include",
          keepalive: true,
        }).catch(() => {
        });
      });
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  const startUploads = useCallback(
    (files: File[]) => {
      const batchId = makeId();
      files.forEach((file) => {
        const id = makeId();
        setUploads((prev) => [...prev, { id, file, progress: 0, status: "uploading" }]);

        (async () => {
          let settleDelay = 2000;
          let currentFileId: string | undefined;
          try {
            const presign = await presignUpload({
              workspaceId,
              filename: file.name,
              contentType: file.type || "application/octet-stream",
              sizeBytes: file.size,
              batchId,
            }).unwrap();

            currentFileId = presign.file_id;
            patch(id, { fileId: presign.file_id });
            activeFileIdsRef.current.add(presign.file_id);

            const xhr = new XMLHttpRequest();
            patch(id, { xhr });

            await new Promise<void>((resolve, reject) => {
              xhr.open("PUT", presign.upload_url);
              xhr.upload.onprogress = (evt) => {
                if (evt.lengthComputable) {
                  patch(id, { progress: Math.round((evt.loaded / evt.total) * 100) });
                }
              };
              xhr.onload = () =>
                xhr.status >= 200 && xhr.status < 300
                  ? resolve()
                  : reject(new Error(`Upload failed (${xhr.status})`));
              xhr.onerror = () => reject(new Error("Upload failed"));
              xhr.onabort = () => reject(new Error("cancelled"));
              xhr.send(file);
            });

            patch(id, { status: "confirming" });
            await confirmUpload({ fileId: presign.file_id, workspaceId }).unwrap();
            patch(id, { status: "done", progress: 100 });
          } catch (err) {
            const message = err instanceof Error ? err.message : "error";
            settleDelay = 4000;
            const cancelled = message === "cancelled";
            patch(id, {
              status: cancelled ? "cancelled" : "error",
              error: message,
            });
            if (!cancelled && currentFileId) {
              failUpload({ fileId: currentFileId, workspaceId, error: message }).catch(() => {});
            }
          } finally {
            if (currentFileId) activeFileIdsRef.current.delete(currentFileId);
            setTimeout(() => remove(id), settleDelay);
          }
        })();
      });
    },
    [workspaceId, presignUpload, confirmUpload, failUpload, patch, remove]
  );

  const cancelUpload = useCallback(
    (id: string) => {
      setUploads((prev) => {
        prev.find((u) => u.id === id)?.xhr?.abort();
        return prev;
      });
    },
    []
  );

  return { uploads: uploads as UploadItem[], startUploads, cancelUpload };
}
