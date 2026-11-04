"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Download, Eye, Pencil, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import type { FileItem } from "@/lib/types";
import {
  useDeleteFileMutation,
  useGetFileDownloadUrlMutation,
  useGetFilesQuery,
  useRenameFileMutation,
  useRetryFileMutation,
} from "@/lib/api/apiSlice";
import { useFileUploads } from "@/hooks/use-file-uploads";
import { replacementAccept, useFileReplace, type ReplaceState } from "@/hooks/use-file-replace";
import MoreMenu, { type MoreMenuItem } from "@/components/ui/MoreMenu";
import { useFileViewer } from "@/components/files/FileViewerProvider";
import UploadModal from "./UploadModal";
import SidebarSection from "./SidebarSection";

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
  ready: "bg-accent-soft text-accent-dark",
  failed: "bg-rust/15 text-rust",
  cancelled: "bg-border text-muted",
};

const PROCESSING_STATUSES = new Set<FileItem["status"]>(["pending_upload", "processing"]);

type SortOption = "date" | "az" | "za";

const SORT_LABEL: Record<SortOption, string> = {
  date: "Date (newest)",
  az: "Name (A → Z)",
  za: "Name (Z → A)",
};

function sortFiles(files: FileItem[], sortBy: SortOption): FileItem[] {
  const sorted = [...files];
  if (sortBy === "az") {
    sorted.sort((a, b) => a.filename.localeCompare(b.filename));
  } else if (sortBy === "za") {
    sorted.sort((a, b) => b.filename.localeCompare(a.filename));
  } else {
    sorted.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
  }
  return sorted;
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function errorMessage(err: unknown, fallback: string) {
  const data = (err as { data?: { detail?: unknown } } | undefined)?.data;
  return typeof data?.detail === "string" ? data.detail : fallback;
}

function splitName(filename: string) {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? { stem: filename.slice(0, dot), ext: filename.slice(dot) } : { stem: filename, ext: "" };
}

function FileRow({
  file,
  workspaceId,
  replaceState,
  onReplace,
  onAbortReplace,
  onDismissReplace,
}: {
  file: FileItem;
  workspaceId: string;
  replaceState?: ReplaceState;
  onReplace: (next: File) => void;
  onAbortReplace: () => void;
  onDismissReplace: () => void;
}) {
  const { openFile } = useFileViewer();
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);
  const [renameFile, { isLoading: renamingBusy }] = useRenameFileMutation();
  const [deleteFile, { isLoading: deleting }] = useDeleteFileMutation();
  const [retryFile] = useRetryFileMutation();
  const [getDownloadUrl] = useGetFileDownloadUrlMutation();

  const busy = PROCESSING_STATUSES.has(file.status) || !!replaceState;
  const showPageProgress = file.status === "processing" && !!file.pages_total && !replaceState;
  const statusLabel = replaceState
    ? replaceState.status === "error"
      ? "Replace failed"
      : replaceState.status === "confirming"
        ? "Processing"
        : `Replacing ${replaceState.progress}%`
    : showPageProgress
      ? `${file.pages_done ?? 0}/${file.pages_total} pages`
      : STATUS_LABEL[file.status];
  const statusColor = replaceState
    ? replaceState.status === "error"
      ? STATUS_COLOR.failed
      : STATUS_COLOR.processing
    : STATUS_COLOR[file.status];
  const progressPct = showPageProgress
    ? Math.min(100, Math.round(((file.pages_done ?? 0) / (file.pages_total || 1)) * 100))
    : 0;

  useEffect(() => {
    if (renaming) {
      renameRef.current?.focus();
      renameRef.current?.select();
    }
  }, [renaming]);

  function startRename() {
    setDraftName(splitName(file.filename).stem);
    setRowError(null);
    setRenaming(true);
  }

  async function submitRename() {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === splitName(file.filename).stem) {
      setRenaming(false);
      return;
    }
    try {
      await renameFile({ fileId: file.id, workspaceId, filename: `${trimmed}${splitName(file.filename).ext}` }).unwrap();
      setRenaming(false);
    } catch (err) {
      setRowError(errorMessage(err, "Couldn't rename the file."));
    }
  }

  async function download() {
    setRowError(null);
    try {
      const { url } = await getDownloadUrl(file.id).unwrap();
      const link = document.createElement("a");
      link.href = url;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setRowError(errorMessage(err, "Couldn't download the file."));
    }
  }

  async function retry() {
    setRowError(null);
    try {
      await retryFile({ fileId: file.id, workspaceId }).unwrap();
    } catch (err) {
      setRowError(errorMessage(err, "Couldn't retry processing."));
    }
  }

  async function remove() {
    try {
      await deleteFile({ fileId: file.id, workspaceId }).unwrap();
    } catch (err) {
      setConfirmingDelete(false);
      setRowError(errorMessage(err, "Couldn't delete the file."));
    }
  }

  const viewable = !replaceState && file.status !== "pending_upload" && file.status !== "cancelled";
  const viewItem: MoreMenuItem = {
    key: "view",
    label: "View",
    icon: Eye,
    onSelect: () => openFile(file.id),
    disabled: !viewable,
  };

  const menuItems: MoreMenuItem[] = file.dummy ? [viewItem] : [
    viewItem,
    "separator",
    { key: "rename", label: "Rename", icon: Pencil, onSelect: startRename, disabled: busy },
    {
      key: "replace",
      label: "Replace file...",
      icon: RefreshCw,
      onSelect: () => {
        setRowError(null);
        onDismissReplace();
        inputRef.current?.click();
      },
      disabled: busy,
      hint: "Upload a new version - charts and dashboards keep using this file",
    },
    {
      key: "download",
      label: "Download original",
      icon: Download,
      onSelect: download,
      disabled: file.status === "pending_upload" || file.status === "cancelled",
    },
    ...(file.status === "failed" && !replaceState
      ? [{ key: "retry", label: "Retry processing", icon: RotateCcw, onSelect: retry } as MoreMenuItem]
      : []),
    "separator",
    {
      key: "delete",
      label: "Delete",
      icon: Trash2,
      danger: true,
      disabled: !!replaceState,
      onSelect: () => {
        setRowError(null);
        setConfirmingDelete(true);
      },
    },
  ];

  return (
    <li className="group rounded-lg px-1.5 py-1.5 transition-colors hover:bg-bg">
      <div className="flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            replaceState
              ? replaceState.status === "error"
                ? "bg-rust"
                : "animate-pulse bg-gold"
              : file.status === "ready"
                ? "bg-accent"
                : file.status === "failed"
                  ? "bg-rust"
                  : PROCESSING_STATUSES.has(file.status)
                    ? "animate-pulse bg-gold"
                    : "bg-border"
          }`}
        />
        {renaming ? (
          <form
            className="flex min-w-0 flex-1 items-center gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              submitRename();
            }}
          >
            <input
              ref={renameRef}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setRenaming(false);
                }
              }}
              onBlur={submitRename}
              disabled={renamingBusy}
              maxLength={190}
              aria-label="New file name"
              className="min-w-0 flex-1 rounded-md border border-accent bg-card px-1.5 py-0.5 text-sm outline-none"
            />
            <span className="shrink-0 text-[11px] text-muted">{splitName(file.filename).ext}</span>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => viewable && openFile(file.id)}
            disabled={!viewable}
            title={viewable ? `View ${file.filename}` : file.filename}
            className="min-w-0 flex-1 truncate text-left text-sm decoration-accent/50 underline-offset-2 enabled:hover:text-accent-dark enabled:hover:underline disabled:cursor-default"
          >
            {file.filename}
          </button>
        )}
        {!renaming && (
          <span className="flex shrink-0 items-center gap-1.5">
            {file.warning && !replaceState && (
              <AlertTriangle className="size-3.5 text-gold" aria-label={file.warning}>
                <title>{file.warning}</title>
              </AlertTriangle>
            )}
            {file.dummy && (
              <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-medium text-accent-dark">Sample</span>
            )}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusColor}`}>{statusLabel}</span>
            <MoreMenu items={menuItems} label={`More options for ${file.filename}`} />
          </span>
        )}
      </div>

      {replaceState && replaceState.status !== "error" && (
        <div className="ml-3.5 mt-1 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
            <div
              className={`h-full transition-all ${replaceState.status === "confirming" ? "animate-pulse bg-gold" : "bg-accent"}`}
              style={{ width: `${replaceState.progress}%` }}
            />
          </div>
          {replaceState.status === "uploading" && (
            <button type="button" onClick={onAbortReplace} className="text-[10px] text-muted hover:text-rust">
              Cancel
            </button>
          )}
        </div>
      )}

      {showPageProgress && (
        <div className="ml-3.5 mt-1 h-1 overflow-hidden rounded-full bg-border">
          <div className="h-full bg-gold transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      )}

      {file.warning && !replaceState && (
        <p className="ml-3.5 mt-1 text-[10px] leading-snug text-accent-dark">{file.warning}</p>
      )}

      {(rowError || replaceState?.error) && (
        <p className="ml-3.5 mt-1 flex items-start justify-between gap-2 text-[10px] leading-snug text-rust">
          <span>{rowError || replaceState?.error}</span>
          <button
            type="button"
            onClick={() => {
              setRowError(null);
              onDismissReplace();
            }}
            className="shrink-0 text-muted hover:text-text"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </p>
      )}

      {confirmingDelete && (
        <div className="ml-3.5 mt-1.5 flex items-center gap-2 text-[11px]">
          <span className="text-muted">Delete this file?</span>
          <button
            type="button"
            onClick={remove}
            disabled={deleting}
            className="rounded-full bg-rust px-2 py-0.5 font-medium text-white hover:bg-rust/90 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
          <button type="button" onClick={() => setConfirmingDelete(false)} className="text-muted hover:text-text">
            Cancel
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={replacementAccept(file.file_type)}
        className="hidden"
        onChange={(e) => {
          const next = e.target.files?.[0];
          e.target.value = "";
          if (next) onReplace(next);
        }}
      />
    </li>
  );
}

export default function FilesPanel({
  workspaceId,
  open,
  onToggle,
}: {
  workspaceId: string;
  open: boolean;
  onToggle: () => void;
}) {
  const [showUpload, setShowUpload] = useState(false);
  const [poll, setPoll] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("date");

  const { data: files = [] } = useGetFilesQuery(workspaceId, {
    pollingInterval: poll ? 3000 : 0,
  });
  const { uploads, startUploads, cancelUpload } = useFileUploads(workspaceId);
  const { replaceStates, startReplace, abortReplace, dismissReplace } = useFileReplace(workspaceId);

  useEffect(() => {
    setPoll(files.some((f) => PROCESSING_STATUSES.has(f.status)) || Object.keys(replaceStates).length > 0);
  }, [files, replaceStates]);

  const activeUploadFileIds = new Set(
    uploads.map((u) => u.fileId).filter((id): id is string => !!id)
  );
  const visibleFiles = sortFiles(files.filter((f) => !activeUploadFileIds.has(f.id)), sortBy);

  return (
    <>
      <SidebarSection
        title="Files"
        count={files.length}
        dotColor="bg-accent"
        open={open}
        onToggle={onToggle}
        headerExtra={
          open && visibleFiles.length > 1 ? (
            <select
              aria-label="Sort files"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              onClick={(e) => e.stopPropagation()}
              className="rounded-md border border-border bg-bg/60 px-1.5 py-0.5 text-[10px] normal-case text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {(Object.keys(SORT_LABEL) as SortOption[]).map((option) => (
                <option key={option} value={option}>
                  {SORT_LABEL[option]}
                </option>
              ))}
            </select>
          ) : undefined
        }
      >
        <p className="text-[10px] text-muted opacity-80">Use pdf files with tables or text. Avoid visuals.</p>
        <button
          onClick={() => setShowUpload(true)}
          className="mb-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-semibold text-muted transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent-dark"
        >
          + Add file
        </button>

        <ul className="max-h-64 space-y-1.5 overflow-y-auto">
          {uploads.length === 0 && visibleFiles.length === 0 && (
            <li className="py-2 text-xs text-muted">No files yet.</li>
          )}

          {uploads.map((u) => (
            <li
              key={u.id}
              className="rounded-lg border border-border bg-bg/60 px-2.5 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm" title={u.file.name}>
                    {u.file.name}
                  </div>
                  <div className="text-[11px] text-muted">{formatBytes(u.file.size)}</div>
                </div>
                {u.status === "uploading" && (
                  <button
                    className="shrink-0 text-[11px] text-muted hover:text-rust"
                    onClick={() => cancelUpload(u.id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full transition-all ${
                    u.status === "error"
                      ? "bg-rust"
                      : u.status === "done"
                        ? "bg-accent-dark"
                        : "bg-accent"
                  }`}
                  style={{ width: `${u.status === "done" ? 100 : u.progress}%` }}
                />
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                {u.status === "uploading" && `${u.progress}%`}
                {u.status === "confirming" && (
                  <>
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                    Processing...
                  </>
                )}
                {u.status === "done" && (
                  <span className="font-medium text-accent-dark">Uploaded</span>
                )}
                {u.status === "error" && (
                  <span className="font-medium text-rust">Failed</span>
                )}
                {u.status === "cancelled" && "Cancelled"}
              </div>
            </li>
          ))}

          {visibleFiles.map((f) => (
            <FileRow
              key={f.id}
              file={f}
              workspaceId={workspaceId}
              replaceState={replaceStates[f.id]}
              onReplace={(next) => startReplace(f, next)}
              onAbortReplace={() => abortReplace(f.id)}
              onDismissReplace={() => dismissReplace(f.id)}
            />
          ))}
        </ul>
      </SidebarSection>

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onConfirm={(fs) => startUploads(fs)} />
      )}
    </>
  );
}
