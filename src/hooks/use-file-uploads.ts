"use client";

import { useCallback, useState } from "react";
import { useConfirmUploadMutation, usePresignUploadMutation } from "@/lib/api/apiSlice";

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

/**
 * Owns the presign -> PUT -> confirm lifecycle for file uploads, keyed by a
 * stable per-upload id (not array index). Previously each upload's index
 * was computed from `uploads.length` at call time and React batches the
 * setUploads() calls from a synchronous `files.forEach(startUpload)` loop,
 * so every file in a multi-select batch captured the SAME index (0) and
 * kept patching the first item - the 2nd+ file's progress bar never left
 * 0%. Using an id generated up front and matching on it in `patch` fixes
 * that regardless of how many uploads start in the same tick.
 *
 * Lives in a hook (not the upload modal) so progress can be rendered from
 * FilesPanel in the sidebar - the modal closes immediately once the user
 * confirms, but the upload itself keeps running here.
 */
export function useFileUploads(workspaceId: string) {
  const [uploads, setUploads] = useState<InternalItem[]>([]);
  const [presignUpload] = usePresignUploadMutation();
  const [confirmUpload] = useConfirmUploadMutation();

  const patch = useCallback((id: string, next: Partial<InternalItem>) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...next } : u)));
  }, []);

  const remove = useCallback((id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const startUploads = useCallback(
    (files: File[]) => {
      files.forEach((file) => {
        const id = makeId();
        setUploads((prev) => [...prev, { id, file, progress: 0, status: "uploading" }]);

        (async () => {
          let settleDelay = 2000;
          try {
            const presign = await presignUpload({
              workspaceId,
              filename: file.name,
              contentType: file.type || "application/octet-stream",
              sizeBytes: file.size,
            }).unwrap();

            patch(id, { fileId: presign.file_id });

            const xhr = new XMLHttpRequest();
            patch(id, { xhr });

            await new Promise<void>((resolve, reject) => {
              xhr.open("PUT", presign.upload_url);
              xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
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
            patch(id, {
              status: message === "cancelled" ? "cancelled" : "error",
              error: message,
            });
          } finally {
            setTimeout(() => remove(id), settleDelay);
          }
        })();
      });
    },
    [workspaceId, presignUpload, confirmUpload, patch, remove]
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
