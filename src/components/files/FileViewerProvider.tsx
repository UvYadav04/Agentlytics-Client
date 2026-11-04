"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import FileViewerModal from "./FileViewerModal";

type FileViewerContextValue = {
  openFile: (fileId: string) => void;
};

const FileViewerContext = createContext<FileViewerContextValue | null>(null);

export function useFileViewer(): FileViewerContextValue {
  const value = useContext(FileViewerContext);
  if (!value) throw new Error("useFileViewer must be used inside FileViewerProvider");
  return value;
}

export default function FileViewerProvider({ children }: { children: ReactNode }) {
  const [fileId, setFileId] = useState<string | null>(null);
  const openFile = useCallback((id: string) => setFileId(id), []);
  const value = useMemo(() => ({ openFile }), [openFile]);

  return (
    <FileViewerContext.Provider value={value}>
      {children}
      {fileId && <FileViewerModal key={fileId} fileId={fileId} onClose={() => setFileId(null)} />}
    </FileViewerContext.Provider>
  );
}
