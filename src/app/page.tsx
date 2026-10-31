"use client";

import { useMemo, useState } from "react";
import {
  Archive, ArrowRight, Check, CheckCircle2, ChevronRight, CircleAlert, Clock3, Code2, ExternalLink,
  File, FileImage, FileSpreadsheet, FileText, Film, Folder, FolderOpen, HardDrive,
  Image as ImageIcon, LoaderCircle, LockKeyhole, MoreHorizontal, Music2, Package, Presentation,
  RotateCcw, ScanSearch, ShieldCheck, Sparkles, X,
} from "lucide-react";
import {
  FILE_CATEGORIES, classifyFileName, formatFileSize, getAvailableName, moveFileSafely,
  type CategoryId, type DirectoryHandle, type FileHandle, type FileMoveRecord,
} from "@/lib/file-sorter";

interface ScannedFile {
  id: string;
  name: string;
  extension: string;
  categoryId: CategoryId;
  size: number;
  handle: FileHandle;
}

interface Notice {
  kind: "success" | "error" | "info";
  title: string;
  detail?: string;
}

interface FolderDialogMessage {
  title: string;
  detail: string;
}

interface FolderPickerWindow extends Window {
  showDirectoryPicker?: (options: { id: string; mode: "readwrite"; startIn: "downloads" }) => Promise<DirectoryHandle>;
}

const CATEGORY_STYLE: Record<CategoryId, { icon: typeof ImageIcon; tint: string }> = {
  images: { icon: ImageIcon, tint: "mint" },
  documents: { icon: FileText, tint: "lavender" },
  spreadsheets: { icon: FileSpreadsheet, tint: "lemon" },
  presentations: { icon: Presentation, tint: "peach" },
  videos: { icon: Film, tint: "blue" },
  audio: { icon: Music2, tint: "rose" },
  archives: { icon: Archive, tint: "sand" },
  code: { icon: Code2, tint: "sky" },
  installers: { icon: Package, tint: "plum" },
  other: { icon: MoreHorizontal, tint: "gray" },
};

function getExtension(name: string) {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toUpperCase() : "FILE";
}

async function readFolder(directory: DirectoryHandle): Promise<ScannedFile[]> {
  const handles: FileHandle[] = [];
  for await (const entry of directory.values()) {
    if (entry.kind === "file") handles.push(entry);
  }
  const files: ScannedFile[] = [];
  for (let offset = 0; offset < handles.length; offset += 64) {
    const batch = await Promise.all(handles.slice(offset, offset + 64).map(async (handle, index) => {
      const file = await handle.getFile();
      return {
        id: `${handle.name}:${file.lastModified}:${offset + index}`,
        name: handle.name,
        extension: getExtension(handle.name),
        categoryId: classifyFileName(handle.name),
        size: file.size,
        handle,
      } satisfies ScannedFile;
    }));
    files.push(...batch);
  }
  return files.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

function errorText(error: unknown) {
  if (error instanceof Error && error.name === "NotAllowedError") return "Folder access was not granted.";
  if (error instanceof Error && error.name === "NotFoundError") return "This file or folder is no longer available.";
  return error instanceof Error && error.message ? error.message : "Something went wrong while accessing this folder.";
}

export default function Home() {
  const [directory, setDirectory] = useState<DirectoryHandle | null>(null);
  const [files, setFiles] = useState<ScannedFile[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [sortResult, setSortResult] = useState<{ folderName: string; moved: number; failed: string[] } | null>(null);
  const [undoMoves, setUndoMoves] = useState<FileMoveRecord[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [folderDialog, setFolderDialog] = useState<FolderDialogMessage | null>(null);
  const [sortProgress, setSortProgress] = useState(0);

  const counts = useMemo(() => {
    const result = Object.fromEntries(FILE_CATEGORIES.map((category) => [category.id, 0])) as Record<CategoryId, number>;
    for (const file of files) result[file.categoryId] += 1;
    return result;
  }, [files]);
  const activeCategories = FILE_CATEGORIES.filter((category) => counts[category.id] > 0);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  const scanFolder = async (folder: DirectoryHandle, preserveHistory = false) => {
    setIsScanning(true);
    setNotice(null);
    try {
      const found = await readFolder(folder);
      setDirectory(folder);
      setFiles(found);
      if (!preserveHistory) {
        setSortResult(null);
        setUndoMoves([]);
      }
      if (found.length === 0) setNotice({ kind: "info", title: "This folder is already clear", detail: "There are no files at its top level to sort." });
    } catch (error) {
      setNotice({ kind: "error", title: "Could not read this folder", detail: errorText(error) });
    } finally {
      setIsScanning(false);
    }
  };

  const chooseFolder = async () => {
    const browserWindow = window as FolderPickerWindow;
    if (!window.isSecureContext || !browserWindow.showDirectoryPicker) {
      setFolderDialog({
        title: "Folder access isn’t available here",
        detail: "TidyDrop needs a secure connection and a browser with folder access support. Open this site over HTTPS in a recent desktop version of Chrome or Edge, then try again.",
      });
      return;
    }
    try {
      const chosen = await browserWindow.showDirectoryPicker({ id: "tidydrop-folder", mode: "readwrite", startIn: "downloads" });
      await scanFolder(chosen);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setFolderDialog({
          title: "Choose a different folder",
          detail: "Your browser closed the folder selection. Protected system folders can’t be opened here. Try Downloads, Documents, Desktop, or another regular folder.",
        });
        return;
      }
      setFolderDialog({
        title: "TidyDrop couldn’t open that folder",
        detail: `${errorText(error)} Try choosing Downloads, Documents, Desktop, or another regular folder.`,
      });
    }
  };

  const sortFiles = async () => {
    if (!directory || files.length === 0 || isSorting) return;
    const sourceFiles = [...files];
    const moved: FileMoveRecord[] = [];
    const failed: string[] = [];
    const destinationCache = new Map<CategoryId, { handle: DirectoryHandle; names: Set<string> }>();
    setSortResult(null);
    setUndoMoves([]);
    setIsSorting(true);
    setSortProgress(0);
    setNotice(null);

    for (let index = 0; index < sourceFiles.length; index += 1) {
      const file = sourceFiles[index];
      try {
        let destination = destinationCache.get(file.categoryId);
        if (!destination) {
          const category = FILE_CATEGORIES.find((item) => item.id === file.categoryId)!;
          const handle = await directory.getDirectoryHandle(category.name, { create: true });
          const names = new Set<string>();
          for await (const entry of handle.values()) names.add(entry.name.toLocaleLowerCase());
          destination = { handle, names };
          destinationCache.set(file.categoryId, destination);
        }
        const newName = getAvailableName(file.name, destination.names);
        destination.names.add(newName.toLocaleLowerCase());
        try {
          moved.push(await moveFileSafely(directory, file.handle, destination.handle, newName));
        } catch (error) {
          destination.names.delete(newName.toLocaleLowerCase());
          throw error;
        }
      } catch (error) {
        failed.push(`${file.name}: ${errorText(error)}`);
      }
      if (index % 10 === 0 || index + 1 === sourceFiles.length) setSortProgress(index + 1);
    }

    setUndoMoves(moved);
    try {
      setFiles(await readFolder(directory));
    } catch {
      setFiles(sourceFiles.filter((file) => !moved.some((item) => item.sourceName === file.name)));
    }
    setSortResult({ folderName: directory.name, moved: moved.length, failed });
    setShowConfirm(false);
    if (moved.length > 0) {
      setNotice({
        kind: failed.length ? "info" : "success",
        title: failed.length ? `Sorted ${moved.length} files; ${failed.length} need attention` : `All ${moved.length} files are sorted`,
        detail: failed.length ? `${failed.slice(0, 2).join("; ")}${failed.length > 2 ? `; and ${failed.length - 2} more` : ""}. Files that could not be moved remain where they were.` : "Your files are in type folders. You can undo this sort.",
      });
    } else {
      setNotice({ kind: "error", title: "No files were moved", detail: failed[0] || "Try scanning the folder again." });
    }
    setIsSorting(false);
  };

  const undoLastSort = async () => {
    if (!undoMoves.length || isUndoing) return;
    setIsUndoing(true);
    const records = [...undoMoves].reverse();
    let restored = 0;
    const failed: string[] = [];
    const stillPending: FileMoveRecord[] = [];
    for (const record of records) {
      try {
        const file = await record.destinationDirectory.getFileHandle(record.destinationName);
        const names = new Set<string>();
        for await (const entry of record.sourceDirectory.values()) names.add(entry.name.toLocaleLowerCase());
        const restoredName = getAvailableName(record.sourceName, names);
        await moveFileSafely(record.destinationDirectory, file, record.sourceDirectory, restoredName);
        restored += 1;
      } catch (error) {
        failed.push(`${record.destinationName}: ${errorText(error)}`);
        stillPending.push(record);
      }
    }
    setUndoMoves(stillPending);
    if (stillPending.length === 0) setSortResult(null);
    if (directory) {
      try { setFiles(await readFolder(directory)); } catch { /* Keep the last visible scan if access has changed. */ }
    }
    setNotice({
      kind: failed.length ? "info" : "success",
      title: failed.length ? `Restored ${restored} files; ${failed.length} could not be restored` : `Restored ${restored} files to ${sortResult?.folderName || "their original folder"}`,
      detail: failed[0] || "Files are back in the original folder. Name conflicts were kept safe with a numbered filename.",
    });
    setIsUndoing(false);
  };

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="TidyDrop home"><span className="brand-mark"><FolderOpen size={21} /></span><span>TidyDrop</span></a>
        <nav className="topbar-actions" aria-label="Main navigation">
          <span className="privacy-pill"><ShieldCheck size={15} /> Files stay on your device</span>
          <button type="button" className="button button-primary button-header" onClick={chooseFolder} disabled={isScanning || isSorting}><Folder size={16} /> {directory ? "Change folder" : "Choose a folder"}</button>
        </nav>
      </header>

      <section className={`hero ${directory ? "hero-compact" : ""}`} id="top">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={14} /> A little order, right where you need it</span>
          <h1>{directory ? <>Sorting your <em>{directory.name}</em> folder</> : <>Your Downloads folder,<br /><em>finally in order.</em></>}</h1>
          <p className="hero-description">Choose a folder and TidyDrop will group loose files by type. Preview every change first; nothing moves until you say so.</p>
          <div className="hero-actions">
            <button type="button" className="button button-primary button-large" onClick={chooseFolder} disabled={isScanning || isSorting}>
              {isScanning ? <LoaderCircle className="spin" size={18} /> : <FolderOpen size={18} />}
              {directory ? "Choose another folder" : "Choose your Downloads folder"}<ArrowRight size={16} />
            </button>
            <span className="hero-note"><LockKeyhole size={14} /> Private by design. No uploads.</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <div className="art-folder"><FolderOpen size={84} strokeWidth={1.15} /></div>
          <div className="art-file art-file-image"><ImageIcon size={18} /><span /></div>
          <div className="art-file art-file-doc"><FileText size={18} /><span /></div>
          <div className="art-file art-file-video"><Film size={18} /><span /></div>
          <div className="art-spark spark-a">✳</div><div className="art-spark spark-b">✳</div>
          <div className="art-caption"><span className="caption-dot" /> A fresh start for your files</div>
        </div>
      </section>

      {notice && <div className={`notice notice-${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}>
        {notice.kind === "success" ? <CheckCircle2 size={19} /> : notice.kind === "error" ? <CircleAlert size={19} /> : <ShieldCheck size={19} />}
        <div className="notice-copy"><strong>{notice.title}</strong>{notice.detail && <p>{notice.detail}</p>}</div>
        <button type="button" className="icon-button notice-dismiss" onClick={() => setNotice(null)} aria-label="Dismiss message"><X size={17} /></button>
      </div>}

      {directory ? <>
        <section className="folder-overview" aria-label="Folder overview">
          <div className="overview-heading">
            <div className="folder-title-icon"><FolderOpen size={20} /></div>
            <div><span className="section-kicker">SELECTED FOLDER</span><h2>{directory.name}</h2></div>
            <button type="button" className="button button-soft overview-scan" onClick={() => scanFolder(directory, true)} disabled={isScanning || isSorting}>
              {isScanning ? <LoaderCircle className="spin" size={16} /> : <ScanSearch size={16} />}{isScanning ? "Scanning…" : "Scan again"}
            </button>
          </div>
          <div className="stat-grid">
            <div className="stat-card"><span className="stat-icon stat-green"><File size={17} /></span><span className="stat-label">Loose files</span><strong>{isScanning ? "…" : files.length.toLocaleString()}</strong><small>at the folder’s top level</small></div>
            <div className="stat-card"><span className="stat-icon stat-lilac"><Folder size={17} /></span><span className="stat-label">File groups</span><strong>{activeCategories.length}</strong><small>ready to organize</small></div>
            <div className="stat-card"><span className="stat-icon stat-yellow"><HardDrive size={17} /></span><span className="stat-label">Space selected</span><strong>{formatFileSize(totalBytes)}</strong><small>across these files</small></div>
            <div className="stat-card stat-card-note"><span className="stat-icon stat-blue"><ShieldCheck size={17} /></span><span className="stat-label">Your files</span><strong>Stay local</strong><small>nothing is uploaded or shared</small></div>
          </div>
        </section>

        {sortResult && <section className="result-panel" aria-live="polite">
          <div className="result-check"><Check size={21} /></div>
          <div className="result-copy"><span className="section-kicker">SORT COMPLETE</span><h2>{sortResult.moved.toLocaleString()} files organized in {sortResult.folderName}</h2><p>{sortResult.failed.length ? `${sortResult.failed.length} file${sortResult.failed.length === 1 ? "" : "s"} could not be moved; originals remain safe.` : "Everything went into a folder by file type."}</p></div>
          {undoMoves.length > 0 && <button className="button button-outline" type="button" onClick={undoLastSort} disabled={isUndoing}>{isUndoing ? <LoaderCircle className="spin" size={16} /> : <RotateCcw size={16} />}{isUndoing ? "Restoring…" : "Undo last sort"}</button>}
        </section>}

        <section className="organize-section">
          <div className="section-heading"><div><span className="section-kicker">YOUR SORTING PREVIEW</span><h2>Every file, in its place</h2><p>Files are grouped by type. Existing folders and nested files are left alone.</p></div>{files.length > 0 && <span className="preview-count">{files.length.toLocaleString()} files ready</span>}</div>
          {files.length === 0 ? <div className="empty-panel"><div className="empty-icon"><CheckCircle2 size={25} /></div><h3>Nothing to sort right now</h3><p>Choose another folder or add files here, then scan again.</p></div> : <>
            <div className="category-grid">
              {activeCategories.map((category) => {
                const style = CATEGORY_STYLE[category.id];
                const Icon = style.icon;
                const examples = files.filter((file) => file.categoryId === category.id).slice(0, 3);
                return <article className={`category-card tint-${style.tint}`} key={category.id}>
                  <div className="category-card-top"><span className="category-icon"><Icon size={19} /></span><span className="category-count">{counts[category.id]}</span></div>
                  <h3>{category.name}</h3><p>{category.description}</p>
                  <div className="category-examples" aria-label="Example files">{examples.map((file) => <span key={file.id} title={file.name}>{file.name}</span>)}{counts[category.id] > examples.length && <span className="more-files">+{counts[category.id] - examples.length} more</span>}</div>
                </article>;
              })}
            </div>

            <div className="file-list-panel">
              <div className="file-list-heading"><div><span className="section-kicker">FILES IN THIS FOLDER</span><h3>Review the plan</h3></div><span className="file-list-subtitle">Top-level files only</span></div>
              <div className="file-list" role="list">
                {files.slice(0, 12).map((file) => {
                  const style = CATEGORY_STYLE[file.categoryId];
                  const Icon = style.icon;
                  const category = FILE_CATEGORIES.find((item) => item.id === file.categoryId)!;
                  return <div className="file-row" role="listitem" key={file.id}>
                    <span className={`file-type-icon tint-${style.tint}`}><Icon size={17} /></span>
                    <div className="file-name-wrap"><strong title={file.name}>{file.name}</strong><small>{file.extension} · {formatFileSize(file.size)}</small></div>
                    <ChevronRight className="file-chevron" size={15} /><span className="file-destination">{category.name}</span>
                  </div>;
                })}
                {files.length > 12 && <div className="file-list-more">and {files.length - 12} more files in the preview</div>}
              </div>
            </div>

            <div className="sort-action-bar">
              <div className="sort-action-copy"><span className="sort-action-icon"><ShieldCheck size={18} /></span><div><strong>Ready when you are</strong><span>Review the plan, then confirm to move {files.length.toLocaleString()} files.</span></div></div>
              <button type="button" className="button button-primary button-sort" onClick={() => setShowConfirm(true)} disabled={isScanning || isSorting}><Sparkles size={17} /> Sort {files.length.toLocaleString()} {files.length === 1 ? "file" : "files"} <ArrowRight size={16} /></button>
            </div>
          </>}
        </section>
      </> : <section className="getting-started" id="how-it-works">
        <div className="section-heading"><div><span className="section-kicker">THREE SIMPLE STEPS</span><h2>Clear the clutter, keep control</h2><p>Pick a folder you want to tidy. TidyDrop handles the rest on your device.</p></div></div>
        <div className="steps-grid">
          <article className="step-card"><span className="step-number">01</span><span className="step-icon step-green"><FolderOpen size={21} /></span><h3>Choose a folder</h3><p>Downloads, Desktop, or any folder you give read and write access to.</p></article>
          <article className="step-card"><span className="step-number">02</span><span className="step-icon step-purple"><FileImage size={21} /></span><h3>Preview the plan</h3><p>See file types and destination folders before anything changes.</p></article>
          <article className="step-card"><span className="step-number">03</span><span className="step-icon step-yellow"><CheckCircle2 size={21} /></span><h3>Sort with confidence</h3><p>Confirm the move. Name conflicts get a number, and you can undo the last sort.</p></article>
        </div>
        <div className="privacy-note"><span className="privacy-note-icon"><LockKeyhole size={18} /></span><div><strong>Your folder stays yours</strong><p>TidyDrop runs in your browser. It only reads and moves files after you choose a folder and approve access.</p></div><a href="#top">Got it <ArrowRight size={14} /></a></div>
      </section>}

      <footer className="site-footer">
        <span>Made for a calmer desktop.</span>
        <span className="footer-local"><ShieldCheck size={14} /> Local by default</span>
        <a className="footer-credit" href="https://x.com/Aish2004Gupta" target="_blank" rel="noopener noreferrer" aria-label="Made by X — Aishwary Gupta on X">
          Made by <strong>X</strong><ExternalLink size={13} aria-hidden="true" />
        </a>
      </footer>

      {folderDialog && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setFolderDialog(null)}>
        <section className="confirm-dialog picker-help-dialog" role="dialog" aria-modal="true" aria-labelledby="folder-help-title">
          <div className="dialog-head">
            <span className="dialog-icon"><FolderOpen size={21} /></span>
            <button className="icon-button" type="button" aria-label="Close folder help" onClick={() => setFolderDialog(null)}><X size={18} /></button>
          </div>
          <span className="section-kicker">TIDYDROP FOLDER ACCESS</span>
          <h2 id="folder-help-title">{folderDialog.title}</h2>
          <p className="dialog-intro">{folderDialog.detail}</p>
          <div className="safe-note"><ShieldCheck size={16} /><span>Your files stay on your device. The browser’s own security prompt uses the site address to identify which site requested access.</span></div>
          <div className="dialog-actions">
            <button type="button" className="button button-outline" onClick={() => setFolderDialog(null)}>Close</button>
            <button type="button" className="button button-primary" onClick={() => { setFolderDialog(null); void chooseFolder(); }}><FolderOpen size={16} /> Choose another folder</button>
          </div>
        </section>
      </div>}

      {showConfirm && directory && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !isSorting && setShowConfirm(false)}>
        <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="dialog-head"><span className="dialog-icon"><FolderOpen size={21} /></span><button className="icon-button" type="button" aria-label="Close dialog" onClick={() => !isSorting && setShowConfirm(false)} disabled={isSorting}><X size={18} /></button></div>
          <span className="section-kicker">ONE LAST LOOK</span><h2 id="confirm-title">Sort {files.length.toLocaleString()} files?</h2>
          <p className="dialog-intro">We’ll create type folders inside <strong>{directory.name}</strong> and move each loose file into its matching folder.</p>
          <div className="confirm-categories">{activeCategories.map((category) => {
            const style = CATEGORY_STYLE[category.id];
            const Icon = style.icon;
            return <div className="confirm-category" key={category.id}><span className={`file-type-icon tint-${style.tint}`}><Icon size={16} /></span><span>{category.name}</span><strong>{counts[category.id]}</strong></div>;
          })}</div>
          <div className="safe-note"><ShieldCheck size={16} /><span>Existing files are kept safe with numbered names. Nested folders are not touched.</span></div>
          {isSorting && <div className="progress-wrap"><div className="progress-label"><span>Sorting files…</span><span>{sortProgress} / {files.length}</span></div><div className="progress-track"><span style={{ width: `${files.length ? (sortProgress / files.length) * 100 : 0}%` }} /></div></div>}
          <div className="dialog-actions"><button type="button" className="button button-outline" onClick={() => setShowConfirm(false)} disabled={isSorting}>Go back</button><button type="button" className="button button-primary" onClick={sortFiles} disabled={isSorting || files.length === 0}>{isSorting ? <LoaderCircle className="spin" size={17} /> : <Check size={17} />}{isSorting ? "Sorting…" : "Yes, sort these files"}</button></div>
          <p className="dialog-footnote"><Clock3 size={13} /> Keep this tab open while a large folder is sorting.</p>
        </section>
      </div>}
    </main>
  );
}
