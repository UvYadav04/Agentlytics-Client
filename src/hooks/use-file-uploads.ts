"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConfirmUploadMutation, usePresignUploadMutation } from "@/lib/api/apiSlice";
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

  // Backend file_ids currently mid-upload (PUT to S3 in flight, or waiting on /confirm) - kept as
  // a ref rather than derived from `uploads` state so the beforeunload/pagehide listeners below
  // (registered once, on mount) always see the current set without needing to be re-registered
  // every time an upload's status changes.
  const activeFileIdsRef = useRef<Set<string>>(new Set());

  const patch = useCallback((id: string, next: Partial<InternalItem>) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...next } : u)));
  }, []);

  const remove = useCallback((id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  // If the tab is closed/refreshed mid-upload, the presign -> PUT -> confirm chain above just
  // stops - there's no janitor on the backend for a File doc left sitting at "pending_upload"
  // forever. This can't fully prevent that (browsers give JS no way to run an async cleanup after
  // the user actually confirms leaving), but it covers the two things that are possible: warn via
  // the native beforeunload dialog while something is in flight, and if the user leaves anyway,
  // best-effort tell the backend to cancel/clean up whatever was uploading (a `fetch` with
  // `keepalive: true` is the modern, CORS/credentials-safe way to do this - unlike
  // navigator.sendBeacon, it still sends the auth cookie and isn't restricted to simple-request
  // content types).
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (activeFileIdsRef.current.size === 0) return;
      e.preventDefault();
      // Chrome (and the spec) require returnValue to be set for the confirmation prompt to show;
      // the actual string is ignored by every modern browser in favor of its own fixed wording.
      e.returnValue = "";
    }

    function handlePageHide() {
      activeFileIdsRef.current.forEach((fileId) => {
        fetch(`${API_BASE_URL}/files/${fileId}/cancel`, {
          method: "POST",
          credentials: "include",
          keepalive: true,
        }).catch(() => {
          // Best-effort - nothing left to do if this doesn't land, the file just stays
          // pending_upload until the backend's own stale-upload cleanup catches it.
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
            activeFileIdsRef.current.add(presign.file_id);

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
            // Whatever fileId this upload had (if it got that far) is no longer in flight either
            // way - success, error, or abandoned mid-PUT before even confirming.
            setUploads((prev) => {
              const fileId = prev.find((u) => u.id === id)?.fileId;
              if (fileId) activeFileIdsRef.current.delete(fileId);
              return prev;
            });
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
