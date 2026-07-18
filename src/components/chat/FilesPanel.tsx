"use client";

import { useEffect, useState } from "react";
import type { FileItem } from "@/lib/types";
import { useDeleteFileMutation, useGetFilesQuery } from "@/lib/api/apiSlice";
import UploadModal from "./UploadModal";

const STATUS_LABEL: Record<FileItem["status"], string> = {
  pending_upload: "Uploading",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
  cancelled: "Cancelled",
};

const STATUS_COLOR: Record<FileItem["status"], string> = {
  pending_upload: "bg-gold/20 text-gold",
  processing: "bg-gold/20 text-gold",
  ready: "bg-teal/15 text-teal",
  failed: "bg-rust/15 text-rust",
  cancelled: "bg-border text-muted",
};

const PROCESSING_STATUSES = new Set<FileItem["status"]>(["pending_upload", "processing"]);

export default function FilesPanel({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  // Starts true so a freshly-opened panel polls until we actually know
  // nothing's processing; RTK Query re-evaluates pollingInterval every
  // render, so this settles down automatically once files load.
  const [poll, setPoll] = useState(true);

  const { data: files = [] } = useGetFilesQuery(workspaceId, {
    pollingInterval: poll ? 3000 : 0,
  });
  const [deleteFile] = useDeleteFileMutation();

  useEffect(() => {
    setPoll(files.some((f) => PROCESSING_STATUSES.has(f.status)));
  }, [files]);

  return (
    <div className="border-b border-border">
      <button
        className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted hover:text-text"
        onClick={() => setOpen((v) => !v)}
      >
        <span>Files ({files.length})</span>
        <span>{open ? "-" : "+"}</span>
      </button>

      {open && (
        <div className="px-3 pb-3">
          <button
            onClick={() => setShowUpload(true)}
            className="mb-2 w-full rounded-lg border border-dashed border-border py-1.5 text-xs text-muted hover:border-accent hover:text-accent-dark transition-colors"
          >
            + Upload files
          </button>

          <ul className="max-h-56 space-y-1.5 overflow-y-auto">
            {files.length === 0 && (
              <li className="text-xs text-muted py-2">No files yet.</li>
            )}
            {files.map((f) => (
              <li
                key={f.id}
                className="group flex items-center justify-between gap-2 rounded-lg px-1.5 py-1 hover:bg-bg"
              >
                <span className="truncate text-sm" title={f.filename}>
                  {f.filename}
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLOR[f.status]}`}
                  >
                    {STATUS_LABEL[f.status]}
                  </span>
                  <button
                    className="hidden text-[10px] text-muted hover:text-rust group-hover:inline"
                    onClick={() => deleteFile({ fileId: f.id, workspaceId })}
                  >
                    Delete
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showUpload && (
        <UploadModal workspaceId={workspaceId} onClose={() => setShowUpload(false)} />
      )}
    </div>
  );
}
