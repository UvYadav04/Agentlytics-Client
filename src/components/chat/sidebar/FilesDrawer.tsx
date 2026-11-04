"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  PanelLeftClose,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
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
import UploadModal from "../UploadModal";

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
  ready: "bg-teal/20 text-teal",
  failed: "bg-rust/20 text-rust",
  cancelled: "bg-white/10 text-[#9ca3af]",
};

const PROCESSING_STATUSES = new Set<FileItem["status"]>(["pending_upload", "processing"]);

type SortOption = "date" | "az" | "za";

const SORT_LABEL: Record<SortOption, string> = {
  date: "Newest",
  az: "Name (A-Z)",
  za: "Name (Z-A)",
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
  const isSheet = file.filename.endsWith(".csv") || file.filename.endsWith(".xlsx") || file.filename.endsWith(".xls");
  const FileIcon = isSheet ? FileSpreadsheet : FileText;

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
    } catch {
      setRowError("Couldn't rename file.");
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
    } catch {
      setRowError("Couldn't download file.");
    }
  }

  async function retry() {
    setRowError(null);
    try {
      await retryFile({ fileId: file.id, workspaceId }).unwrap();
    } catch {
      setRowError("Couldn't retry processing.");
    }
  }

  const viewable = !replaceState && file.status !== "pending_upload" && file.status !== "cancelled";

  const menuItems: MoreMenuItem[] = [
    {
      key: "view",
      label: "Preview",
      icon: Eye,
      onSelect: () => openFile(file.id),
      disabled: !viewable,
    },
    {
      key: "download",
      label: "Download",
      icon: Download,
      onSelect: download,
      disabled: file.status === "pending_upload" || file.status === "cancelled",
    },
    {
      key: "replace",
      label: "Replace",
      icon: RotateCcw,
      disabled: busy,
      onSelect: () => {
        setRowError(null);
        onDismissReplace();
        inputRef.current?.click();
      },
    },
    {
      key: "rename",
      label: "Rename",
      icon: Pencil,
      disabled: busy || renamingBusy,
      onSelect: startRename,
    },
    ...(file.status === "failed" && !replaceState
      ? [
          {
            key: "retry",
            label: "Retry",
            icon: RefreshCw,
            disabled: busy,
            onSelect: retry,
          } as MoreMenuItem,
        ]
      : []),
    {
      key: "delete",
      label: "Delete",
      icon: Trash2,
      danger: true,
      disabled: deleting,
      onSelect: () => setConfirmingDelete(true),
    },
  ];

  return (
    <li className="group rounded-xl border border-[#252836] bg-[#191c25] p-2.5 transition-all hover:border-accent/40 hover:bg-[#1d212c]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <FileIcon className="mt-0.5 size-4 shrink-0 text-[#9ca3af] group-hover:text-accent" />
          <div className="min-w-0 flex-1">
            {renaming ? (
              <input
                ref={renameRef}
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={submitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitRename();
                  if (e.key === "Escape") setRenaming(false);
                }}
                className="w-full rounded border border-accent bg-[#13151b] px-1.5 py-0.5 text-xs text-white outline-none"
              />
            ) : (
              <div
                className="truncate text-xs font-medium text-white cursor-pointer hover:text-accent"
                title={file.filename}
                onClick={() => file.status === "ready" && openFile(file.id)}
              >
                {file.filename}
              </div>
            )}
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#9ca3af]">
              <span>{formatBytes(file.size_bytes ?? 0)}</span>
              <span>·</span>
              <span className={`rounded px-1.5 py-0.2 font-medium ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {file.status === "ready" && (
            <button
              onClick={() => openFile(file.id)}
              title="Preview"
              className="rounded p-1 text-[#9ca3af] hover:bg-white/10 hover:text-white"
            >
              <Eye className="size-3.5" />
            </button>
          )}
          <MoreMenu items={menuItems} />
        </div>
      </div>

      {rowError && <p className="mt-1 text-[10px] text-rust">{rowError}</p>}

      {confirmingDelete && (
        <div className="mt-2 flex items-center justify-between rounded-lg bg-rust/20 border border-rust/30 p-2 text-xs text-rust">
          <span>Delete file?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmingDelete(false)}
              className="text-[#9ca3af] hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                await deleteFile({ fileId: file.id, workspaceId }).unwrap().catch(() => {});
                setConfirmingDelete(false);
              }}
              className="font-bold text-rust hover:underline"
            >
              Confirm
            </button>
          </div>
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

export default function FilesDrawer({
  workspaceId,
  onClose,
}: {
  workspaceId: string;
  onClose: () => void;
}) {
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [poll, setPoll] = useState(true);

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

  const visibleFiles = useMemo(() => {
    const unuploaded = files.filter((f) => !activeUploadFileIds.has(f.id));
    const sorted = sortFiles(unuploaded, sortBy);
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter((f) => f.filename.toLowerCase().includes(q));
  }, [files, activeUploadFileIds, sortBy, searchQuery]);

  return (
    <div className="flex h-full flex-col bg-[#13151b] text-[#d1d5db]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e212b] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-white">Files & Data</span>
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-accent">
            {files.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowUpload(true)}
            aria-label="Upload files"
            className="flex h-7 items-center gap-1.5 rounded-lg bg-accent px-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-accent-dark"
          >
            <Upload className="size-3.5" />
            <span>Upload</span>
          </button>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-lg p-1 text-[#9ca3af] hover:bg-white/[0.08] hover:text-white"
            title="Close drawer"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="flex items-center gap-2 border-b border-[#1e212b] p-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#6b7280]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter files..."
            className="w-full rounded-xl border border-[#262a38] bg-[#1a1d26] py-1.5 pl-7 pr-6 text-xs text-white placeholder-[#6b7280] outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#9ca3af] hover:text-white"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        <select
          aria-label="Sort files"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded-xl border border-[#262a38] bg-[#1a1d26] px-2 py-1.5 text-xs text-[#9ca3af] outline-none hover:text-white focus:border-accent"
        >
          {(Object.keys(SORT_LABEL) as SortOption[]).map((option) => (
            <option key={option} value={option}>
              {SORT_LABEL[option]}
            </option>
          ))}
        </select>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Upload in progress bars */}
        {uploads.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {uploads.map((u) => (
              <div
                key={u.id}
                className="rounded-xl border border-accent/30 bg-accent/10 p-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate font-medium text-white">{u.file.name}</span>
                  {u.status === "uploading" && (
                    <button
                      onClick={() => cancelUpload(u.id)}
                      className="text-[10px] text-[#9ca3af] hover:text-rust"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#262a38]">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${u.status === "done" ? 100 : u.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {visibleFiles.length === 0 && uploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center text-xs text-[#9ca3af]">
            {searchQuery ? (
              <p>No files matching &quot;{searchQuery}&quot;</p>
            ) : (
              <>
                <p className="font-medium text-white">No files uploaded</p>
                <p className="mt-1 text-[11px] text-[#6b7280]">
                  Upload CSV spreadsheets, PDF tables, or text reports to analyze.
                </p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="mt-3 flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark"
                >
                  <Plus className="size-3.5" />
                  <span>Upload File</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <ul className="space-y-1.5">
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
        )}
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onConfirm={(fs) => startUploads(fs)}
        />
      )}
    </div>
  );
}
